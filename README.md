# PingesoPasteleria

Repositorio para proyecto P17


## Correr locamente wordpress que esta en la nube

Para ejecutar wordpress de manera local hay dos opciones:

### Opción 1: rapida (version desactualizada)
1. Ir a la carpeta "Wordpress infinityFree" y ejecutar el comando "docker compose up -d"
2. Una vez el contenedor este corriendo, ir a http://localhost:8080

### Opción 2: 15 min (version actualizada)
1. Ir al wordpress de la nube y con el plugin "All in One Migration" exportar la pagina como archivo
2. En caso de fallar la descarga (se queda pegado y no avanza), ir a los archivos (con file manager de InfinityFree) a la carpeta htdocs/wp-content/ai1wm-backups y descargar el archivo .wpress (si hay más de uno descargar el más actual)
3. En la ruta "Wordpress infinityFree"/"Docker compose wordpress base" ejecutar el comando "docker compose up -d", luego ir a http://localhost:8080
4. Completar la instalación de wordpress e instalar el plugin "All in One Migration", luego importar el archivo .wpress descargado anteriormente (al hacer esto se recomienda eliminar todos los plugins, paginas y entradas que wordpress trae por defecto)
5. En wordpress, ir a ajustes/"enlaces permanentes", y darle a guardar cambios (sin modificar nada)