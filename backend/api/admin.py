from django.contrib import admin
from .models import *

# Personalizar vista admin
admin.site.site_header = "LyF Grupo Farmacéutico"
admin.site.site_title = "LyF Grupo Farmacéutico"
admin.site.index_title = "¡Bienvenidos!"

# Resgistramos los modelos aqui
admin.site.register(User)
admin.site.register(Portafolio)
admin.site.register(Producto)
admin.site.register(Promocion)
admin.site.register(Curso)
admin.site.register(HistorialCompra)
admin.site.register(AuditoriaCambio)
