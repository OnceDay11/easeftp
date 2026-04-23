package files

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

var ErrInvalidPath = errors.New("invalid path")

type Entry struct {
	Name         string    `json:"name"`
	Path         string    `json:"path"`
	IsDir        bool      `json:"isDir"`
	Size         int64     `json:"size"`
	ModifiedAt   time.Time `json:"modifiedAt"`
	Classification string  `json:"classification"`
}

type Listing struct {
	Path    string  `json:"path"`
	Entries []Entry `json:"entries"`
}

type Service interface {
	List(relativePath string) (Listing, error)
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

		items = append(items, Entry{
			Name:           entry.Name(),
			Path:           itemPath,
			IsDir:          entry.IsDir(),
			Size:           info.Size(),
			ModifiedAt:     info.ModTime(),
			Classification: defaultClassification(entry.IsDir()),
		})
	}

	sort.Slice(items, func(i, j int) bool {
		if items[i].IsDir != items[j].IsDir {
			return items[i].IsDir
		}
		return strings.ToLower(items[i].Name) < strings.ToLower(items[j].Name)
	})

	return Listing{Path: cleanPath, Entries: items}, nil
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

func defaultClassification(isDir bool) string {
	if isDir {
		return "internal"
	}
	return "public-shareable"
}
