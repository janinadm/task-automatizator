<!--
  Default Layout (Layout por defecto)
  This is the base layout that wraps all pages unless a specific layout is specified.
  The <slot /> component renders the current page's content inside this wrapper.
  (Este es el layout base que envuelve todas las páginas a menos que se especifique uno concreto.
   El componente <slot /> renderiza el contenido de la página actual dentro de este wrapper.)
-->
<template>
  <div class="min-h-screen font-sans antialiased">
    <slot />
  </div>
</template>
