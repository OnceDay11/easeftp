package httpapi

import (
	"encoding/json"
	"errors"
	"fmt"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/easeftp/easeftp/apps/server/internal/files"
)

type Server struct {
	files files.Service
	mux   *http.ServeMux
}

type protocolLink struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

func NewServer(fileService files.Service) *Server {
	server := &Server{
		files: fileService,
		mux:   http.NewServeMux(),
	}

	server.routes()
	return server
}

func (server *Server) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	server.mux.ServeHTTP(writer, request)
}

func (server *Server) routes() {
	server.mux.HandleFunc("GET /healthz", server.handleHealth)
	server.mux.HandleFunc("GET /api/files", server.handleListFiles)
	server.mux.HandleFunc("GET /api/files/content", server.handleContent)
	server.mux.HandleFunc("POST /api/shares", server.handleCreateShare)
}

func (server *Server) handleHealth(writer http.ResponseWriter, _ *http.Request) {
	writeJSON(writer, http.StatusOK, map[string]string{"status": "ok"})
}

func (server *Server) handleListFiles(writer http.ResponseWriter, request *http.Request) {
	listing, err := server.files.List(request.URL.Query().Get("path"))
	if err != nil {
		statusCode := http.StatusInternalServerError
		if errors.Is(err, files.ErrInvalidPath) {
			statusCode = http.StatusBadRequest
		}

		writeJSON(writer, statusCode, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(writer, http.StatusOK, listing)
}

func (server *Server) handleContent(writer http.ResponseWriter, request *http.Request) {
	path := request.URL.Query().Get("path")
	file, entry, err := server.files.Open(path)
	if err != nil {
		statusCode := http.StatusNotFound
		if errors.Is(err, files.ErrInvalidPath) {
			statusCode = http.StatusBadRequest
		}
		writeJSON(writer, statusCode, map[string]string{"error": err.Error()})
		return
	}
	defer file.Close()

	disposition := strings.TrimSpace(request.URL.Query().Get("disposition"))
	if disposition == "" {
		disposition = "attachment"
	}

	contentType := mime.TypeByExtension(filepath.Ext(entry.Name))
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	writer.Header().Set("Content-Type", contentType)
	writer.Header().Set("Content-Disposition", fmt.Sprintf("%s; filename=%q", disposition, entry.Name))
	http.ServeContent(writer, request, entry.Name, entry.ModifiedAt, file)
}

func (server *Server) handleCreateShare(writer http.ResponseWriter, request *http.Request) {
	var payload struct {
		Path string `json:"path"`
	}

	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
		writeJSON(writer, http.StatusBadRequest, map[string]string{"error": "invalid share request"})
		return
	}

	entry, err := server.files.Stat(payload.Path)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if errors.Is(err, files.ErrInvalidPath) {
			statusCode = http.StatusBadRequest
		}
		writeJSON(writer, statusCode, map[string]string{"error": err.Error()})
		return
	}

	if entry.IsDir {
		writeJSON(writer, http.StatusBadRequest, map[string]string{"error": "directory sharing is not supported"})
		return
	}

	sharePath := "/api/files/content?path=" + url.QueryEscape(entry.Path)
	shareLinks := server.buildProtocolLinks(request, sharePath)

	writeJSON(writer, http.StatusCreated, map[string]any{
		"path":     entry.Path,
		"fileName": entry.Name,
		"links":    shareLinks,
	})
}

func (server *Server) buildProtocolLinks(request *http.Request, path string) []protocolLink {
	host := request.Host
	if forwardedHost := strings.TrimSpace(request.Header.Get("X-Forwarded-Host")); forwardedHost != "" {
		host = forwardedHost
	}

	links := make([]protocolLink, 0, 4)
	links = append(links,
		protocolLink{Label: "HTTP", URL: "http://" + host + path},
		protocolLink{Label: "HTTPS", URL: "https://" + host + path},
	)

	for _, configured := range []struct {
		label    string
		envNames []string
	}{
		{label: "FTP", envNames: []string{"EASEFTP_FTP_BASE_URL"}},
		{label: "TFTP", envNames: []string{"EASEFTP_TFTP_BASE_URL"}},
		{label: "SFTP", envNames: []string{"EASEFTP_SFTP_BASE_URL", "EASEFTP_STFP_BASE_URL"}},
	} {
		baseURL := ""
		for _, envName := range configured.envNames {
			baseURL = strings.TrimSpace(os.Getenv(envName))
			if baseURL != "" {
				break
			}
		}
		if baseURL == "" {
			baseURL = strings.ToLower(configured.label) + "://" + host
		}
		links = append(links, protocolLink{
			Label: configured.label,
			URL:   strings.TrimRight(baseURL, "/") + path,
		})
	}

	return links
}

func (server *Server) absoluteURL(request *http.Request, path string) string {
	scheme := "http"
	if request.TLS != nil {
		scheme = "https"
	}
	if forwardedProto := request.Header.Get("X-Forwarded-Proto"); forwardedProto != "" {
		scheme = forwardedProto
	}
	return fmt.Sprintf("%s://%s%s", scheme, request.Host, path)
}

func writeJSON(writer http.ResponseWriter, statusCode int, payload any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(statusCode)
	_ = json.NewEncoder(writer).Encode(payload)
}
