package main

import (
	"log"
	"net/http"
	"fmt"
	"crypto/rand"
	"encoding/base64"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/handlers"
	"github.com/timothydarren/WebTY/database"
	"github.com/timothydarren/WebTY/graph"
	"github.com/timothydarren/WebTY/helper"
	"github.com/gorilla/websocket"
)

const defaultPort = "8080"

var Conns = map[string]*websocket.Conn{}

func main() {
	port := helper.GoDotEnvVariable("PORT")
	if port == "" {
		port = defaultPort
	}

	database.MigrateTable()

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
		DB: database.GetInstance(),
		Conns: Conns,
	}}))

	allowedOrigins := handlers.AllowedOrigins([]string{"http://127.0.0.1:5173"}) // Replace with your frontend URL
	allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"})
	allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type"})

	// Use handlers.CORS middleware to enable CORS with specified options
	http.Handle("/", handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(playground.Handler("GraphQL playground", "/query")))
	http.Handle("/query", handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(srv))

	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
		 return true
		},
	   }
	  
	   http.HandleFunc("/websocket", func(w http.ResponseWriter, r *http.Request) {
		// Upgrade HTTP request to WebSocket connection
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
		 // Handle error
		 return
		}
		defer conn.Close()
	  
		// Get a unique identifier for the connection (e.g., user ID)
		identifier, err := generateIdentifier(10) // Replace this with your logic
		if err != nil {
		 fmt.Println("Error:", err)
		 return
		}
		// Add the connection to the map
		Conns[identifier] = conn
	  
		// Handle incoming messages
		for {
		 messageType, p, err := conn.ReadMessage()
				  fmt.Println(messageType, p, err)
		 if err != nil {
		  // Remove connection from the map on error
		  delete(Conns, identifier)
		  return
		 }
	  
		 // Broadcast the message to all connections
		 for _, conn := range Conns {
		  if err := conn.WriteMessage(messageType, p); err != nil {
		   // Remove connection from the map on error
		   delete(Conns, identifier)
		   conn.Close()
		  }
		 }
		}
	   })

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
	
}

func generateIdentifier(length int) (string, error) {
	buffer := make([]byte, length)
	_, err := rand.Read(buffer)
	if err != nil {
	 return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buffer), nil
}