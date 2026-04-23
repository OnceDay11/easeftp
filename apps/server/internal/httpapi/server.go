package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/easeftp/easeftp/apps/server/internal/files"
)

type Server struct {
	files files.Service
	mux   *http.ServeMux
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

func writeJSON(writer http.ResponseWriter, statusCode int, payload any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(statusCode)
	_ = json.NewEncoder(writer).Encode(payload)
}
