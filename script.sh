#!/bin/zsh

echo "Iniciando la búsqueda y descarga de modelos..."

# El rango {1..999} cubre desde un dígito hasta tres dígitos
for i in {1..999}; do
  
  # --create-dirs: Crea la carpeta "modelos" y su subcarpeta "$i" automáticamente
  # -f: Ignora errores HTTP (no crea archivos ni carpetas si da error 404)
  # -s: Ejecuta en modo silencioso
  # -o: Define la ruta exacta donde se guardará el archivo
  curl --create-dirs -f -s "https://rapidmockup-v3.nyc3.cdn.digitaloceanspaces.com/$i/model.glb" -o "modelos/$i/model.glb"
  
  if [[ $? -eq 0 ]]; then
    echo "✔ Encontrado y guardado en: modelos/$i/model.glb"
  fi
done

echo "Proceso finalizado."
