package files

import (
	"errors"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

var ErrInvalidPath = errors.New("invalid path")

type Entry struct {
	Name       string    `json:"name"`
	Path       string    `json:"path"`
	IsDir      bool      `json:"isDir"`
	Size       int64     `json:"size"`
	ModifiedAt time.Time `json:"modifiedAt"`
	Kind       string    `json:"kind"`
}

type Listing struct {
	Path    string  `json:"path"`
	Entries []Entry `json:"entries"`
}

type Service interface {
	List(relativePath string) (Listing, error)
	Stat(relativePath string) (Entry, error)
	Open(relativePath string) (*os.File, Entry, error)
}

type LocalService struct {
	root string
}

func NewLocalService(root string) *LocalService {
	return &LocalService{root: root}
}

func (service *LocalService) List(relativePath string) (Listing, error) {
	cleanPath, absolutePath, err := service.resolve(relativePath)
	if err != nil {
		return Listing{}, err
	}

	entries, err := os.ReadDir(absolutePath)
	if err != nil {
		if errors.Is(err, fs.ErrNotExist) {
			return Listing{}, fmt.Errorf("path %q does not exist: %w", cleanPath, err)
		}
		return Listing{}, err
	}

	items := make([]Entry, 0, len(entries))
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			return Listing{}, err
		}

		itemPath := entry.Name()
		if cleanPath != "." {
			itemPath = filepath.ToSlash(filepath.Join(cleanPath, entry.Name()))
		}

		items = append(items, service.inspectEntry(itemPath, filepath.Join(absolutePath, entry.Name()), info))
	}

	sort.Slice(items, func(i, j int) bool {
		if items[i].IsDir != items[j].IsDir {
			return items[i].IsDir
		}
		return strings.ToLower(items[i].Name) < strings.ToLower(items[j].Name)
	})

	return Listing{Path: cleanPath, Entries: items}, nil
}

func (service *LocalService) Stat(relativePath string) (Entry, error) {
	cleanPath, absolutePath, err := service.resolve(relativePath)
	if err != nil {
		return Entry{}, err
	}

	info, err := os.Stat(absolutePath)
	if err != nil {
		if errors.Is(err, fs.ErrNotExist) {
			return Entry{}, fmt.Errorf("path %q does not exist: %w", cleanPath, err)
		}
		return Entry{}, err
	}

	return service.inspectEntry(cleanPath, absolutePath, info), nil
}

func (service *LocalService) Open(relativePath string) (*os.File, Entry, error) {
	entry, err := service.Stat(relativePath)
	if err != nil {
		return nil, Entry{}, err
	}
	if entry.IsDir {
		return nil, Entry{}, fmt.Errorf("path %q is a directory", relativePath)
	}

	_, absolutePath, err := service.resolve(relativePath)
	if err != nil {
		return nil, Entry{}, err
	}

	file, err := os.Open(absolutePath)
	if err != nil {
		return nil, Entry{}, err
	}

	return file, entry, nil
}

func (service *LocalService) resolve(relativePath string) (string, string, error) {
	path := strings.TrimSpace(relativePath)
	if path == "" || path == "/" {
		path = "."
	}

	cleanPath := filepath.Clean(path)
	if cleanPath == ".." || strings.HasPrefix(cleanPath, "../") || filepath.IsAbs(cleanPath) {
		return "", "", ErrInvalidPath
	}

	absoluteRoot, err := filepath.Abs(service.root)
	if err != nil {
		return "", "", err
	}

	absolutePath := filepath.Join(absoluteRoot, cleanPath)
	absolutePath, err = filepath.Abs(absolutePath)
	if err != nil {
		return "", "", err
	}

	rootWithSeparator := absoluteRoot + string(os.PathSeparator)
	if absolutePath != absoluteRoot && !strings.HasPrefix(absolutePath, rootWithSeparator) {
		return "", "", ErrInvalidPath
	}

	return cleanPath, absolutePath, nil
}

func (service *LocalService) inspectEntry(relativePath string, absolutePath string, info os.FileInfo) Entry {
	_, kind := detectFileTraits(relativePath, absolutePath, info.IsDir())

	return Entry{
		Name:       info.Name(),
		Path:       relativePath,
		IsDir:      info.IsDir(),
		Size:       info.Size(),
		ModifiedAt: info.ModTime(),
		Kind:       kind,
	}
}

func detectFileTraits(relativePath string, absolutePath string, isDir bool) (string, string) {
	if isDir {
		return "inode/directory", "directory"
	}

	fileExtension := strings.ToLower(filepath.Ext(relativePath))
	contentType := mimeByExtension(fileExtension)
	if contentType == "" {
		contentType = detectContentType(absolutePath)
	}
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	return contentType, kindFromMetadata(fileExtension, contentType)
}

func mimeByExtension(extension string) string {
	switch extension {
	case ".txt", ".md", ".log", ".csv", ".json", ".xml", ".yaml", ".yml", ".toml", ".ini", ".go", ".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".py", ".java", ".c", ".cpp", ".h", ".hpp", ".sh", ".sql":
		return "text/plain; charset=utf-8"
	case ".pdf":
		return "application/pdf"
	case ".png":
		return "image/png"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".svg":
		return "image/svg+xml"
	case ".mp4":
		return "video/mp4"
	case ".mp3":
		return "audio/mpeg"
	case ".zip":
		return "application/zip"
	case ".doc", ".docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case ".xls", ".xlsx":
		return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	case ".ppt", ".pptx":
		return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
	default:
		return ""
	}
}

func detectContentType(absolutePath string) string {
	file, err := os.Open(absolutePath)
	if err != nil {
		return ""
	}
	defer file.Close()

	buffer := make([]byte, 512)
	readBytes, err := file.Read(buffer)
	if err != nil {
		return ""
	}
	return http.DetectContentType(buffer[:readBytes])
}

func kindFromMetadata(extension string, mimeType string) string {
	if strings.HasPrefix(mimeType, "image/") {
		return "image"
	}
	if strings.HasPrefix(mimeType, "video/") {
		return "video"
	}
	if strings.HasPrefix(mimeType, "audio/") {
		return "audio"
	}
	if mimeType == "application/pdf" {
		return "pdf"
	}
	if strings.HasPrefix(mimeType, "text/") {
		switch extension {
		case ".go", ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".c", ".cpp", ".h", ".hpp", ".css", ".html", ".sql", ".sh", ".json", ".xml", ".yaml", ".yml", ".toml", ".ini":
			return "code"
		default:
			return "text"
		}
	}
	if strings.Contains(mimeType, "spreadsheet") || extension == ".csv" {
		return "spreadsheet"
	}
	if strings.Contains(mimeType, "presentation") {
		return "presentation"
	}
	if strings.Contains(mimeType, "wordprocessingml") || extension == ".doc" {
		return "document"
	}
	if mimeType == "application/zip" {
		return "archive"
	}
	return "binary"
}
