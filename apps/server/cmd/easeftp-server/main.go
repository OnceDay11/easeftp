package main

import (
	"log"
	"net/http"
	"os"

	"github.com/easeftp/easeftp/apps/server/internal/files"
	"github.com/easeftp/easeftp/apps/server/internal/httpapi"
)

func main() {
	storageRoot := os.Getenv("EASEFTP_STORAGE_ROOT")
	if storageRoot == "" {
		storageRoot = "../../data/storage"
	}

	addr := os.Getenv("EASEFTP_SERVER_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	service := files.NewLocalService(storageRoot)
	handler := httpapi.NewServer(service)

	log.Printf("easeftp server listening on %s with storage root %s", addr, storageRoot)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal(err)
	}
}
