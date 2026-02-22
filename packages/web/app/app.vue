<!--
  App Root Component (Componente raíz de la aplicación)
  This is the entry point of our Vue app. NuxtLayout wraps pages with
  a layout template (auth, dashboard), and NuxtPage renders the current
  route's page component automatically based on the file structure in pages/.
  (Este es el punto de entrada de nuestra app Vue. NuxtLayout envuelve las páginas
   con una plantilla de layout, y NuxtPage renderiza el componente de la ruta actual
   automáticamente basándose en la estructura de archivos en pages/.)
-->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
