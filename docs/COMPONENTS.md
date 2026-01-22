# 🎨 Componentes y Frontend - Banco de Alimentos ULEAM

## Índice
- [Visión General](#visión-general)
- [Organización de Componentes](#organización-de-componentes)
- [Sistema de Diseño](#sistema-de-diseño)
- [Componentes Globales](#componentes-globales)
- [Componentes por Módulo](#componentes-por-módulo)
- [Hooks Personalizados](#hooks-personalizados)
- [Gestión de Estado](#gestión-de-estado)
- [Tailwind CSS y Estilos](#tailwind-css-y-estilos)
- [Patrones de Diseño](#patrones-de-diseño)

---

## Visión General

El frontend del Banco de Alimentos ULEAM está construido con **React** y **Next.js**, siguiendo una arquitectura basada en componentes reutilizables y modulares.

### Tecnologías Frontend:

- **React**: Biblioteca de UI con Server Components
- **Next.js**: Framework con App Router
- **TypeScript**: Type safety en todo el código
- **Tailwind CSS**: Framework de estilos utility-first
- **Lucide React**: Biblioteca de iconos
- **Heroicons**: Iconos adicionales
- **Mapbox GL**: Mapas interactivos
- **date-fns**: Manejo de fechas

### Principios de Diseño:

- ✅ **Componentización**: Todo es un componente reutilizable
- ✅ **Server Components**: Por defecto, para mejor performance
- ✅ **Composición**: Componentes pequeños que se combinan
- ✅ **Accesibilidad**: Semántica HTML y ARIA labels
- ✅ **Responsividad**: Mobile-first design
- ✅ **Type Safety**: TypeScript en todos los componentes

---

## Organización de Componentes

### 📁 Estructura de Componentes

```
src/
├── app/
│   ├── components/              # Componentes globales compartidos
│   │   ├── DashboardLayout.tsx  # Layout principal con sidebar
│   │   ├── Sidebar.tsx          # Navegación lateral
│   │   ├── NotificacionesDropdown.tsx
│   │   ├── AccesibilidadFlotante.tsx
│   │   ├── SupabaseProvider.tsx # Context provider
│   │   └── ui/                  # Componentes UI básicos
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Card.tsx
│   │       └── ...
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Página (usa componentes)
│   │   ├── catalogo/
│   │   └── usuarios/
│   │
│   ├── donante/
│   ├── user/
│   └── operador/
│
└── modules/
    ├── admin/
    │   └── shared/
    │       └── components/      # Componentes específicos de admin
    │
    ├── donante/
    │   └── dashboard/
    │       └── components/      # Componentes de donante
    │
    ├── user/
    │   └── components/          # Componentes de beneficiarios
    │
    └── shared/
        └── components/          # Componentes compartidos entre módulos
            ├── estadisticas/
            ├── tablas/
            └── formularios/
```

### Convenciones de Nomenclatura:

1. **PascalCase**: Nombres de componentes (`DashboardLayout.tsx`)
2. **Sufijo descriptivo**: Indica el tipo (`...Provider.tsx`, `...Context.tsx`)
3. **Carpeta por componente complejo**: Si tiene múltiples archivos
4. **index.ts**: Para exportaciones limpias

**Ejemplo de organización**:
```
src/modules/shared/components/
├── estadisticas/
│   ├── StatsCard.tsx
│   ├── StatsGrid.tsx
│   ├── index.ts               # export { StatsCard, StatsGrid }
│   └── types.ts
├── tablas/
│   ├── DataTable.tsx
│   ├── TableFilters.tsx
│   ├── Pagination.tsx
│   └── index.ts
└── index.ts                   # Re-exporta todo
```

---

## Sistema de Diseño

### 🎨 Paleta de Colores (Tailwind)

El sistema utiliza una paleta de colores definida en `globals.css` y `tailwind.config.ts`:

#### Colores Principales:

```css
:root {
  /* Colores de marca */
  --primary: 142 86% 28%;        /* Verde oliva oscuro */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 142 30% 96%;      /* Verde muy claro */
  --secondary-foreground: 142 100% 10%;
  
  --accent: 142 50% 45%;         /* Verde medio */
  --accent-foreground: 0 0% 100%;
  
  /* Estados */
  --success: 142 76% 36%;        /* Verde éxito */
  --warning: 38 92% 50%;         /* Amarillo advertencia */
  --error: 0 84% 60%;            /* Rojo error */
  --info: 199 89% 48%;           /* Azul información */
  
  /* Neutros */
  --background: 0 0% 100%;
  --foreground: 142 10% 15%;
  --muted: 142 30% 96%;
  --border: 142 30% 82%;
}
```

#### Uso en Componentes:

```tsx
// Colores con clases de Tailwind
<button className="bg-primary text-primary-foreground">
  Botón primario
</button>

<div className="bg-success/10 text-success border-success">
  Mensaje de éxito
</div>

<span className="text-error">Error</span>
<span className="text-warning">Advertencia</span>
<span className="text-info">Información</span>
```

---

### 📏 Espaciado y Tipografía

#### Escala de Espaciado:

```tsx
// Tailwind spacing scale
className="
  p-2    // 0.5rem (8px)
  p-4    // 1rem (16px)
  p-6    // 1.5rem (24px)
  p-8    // 2rem (32px)
  p-12   // 3rem (48px)
"
```

#### Tipografía:

```tsx
// Títulos
<h1 className="text-4xl font-bold">Título Principal</h1>
<h2 className="text-3xl font-semibold">Subtítulo</h2>
<h3 className="text-2xl font-medium">Sección</h3>

// Texto
<p className="text-base">Texto normal</p>
<p className="text-sm text-muted-foreground">Texto secundario</p>
<p className="text-xs text-muted-foreground">Texto pequeño</p>
```

---

### 🃏 Componentes UI Básicos

Los componentes UI básicos están en `src/app/components/ui/`:

#### Button Component:

```tsx
// src/app/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading,
  children,
  className,
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    danger: "bg-error text-white hover:bg-error/90"
  };
  
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg"
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Spinner className="mr-2" /> : null}
      {children}
    </button>
  );
}
```

**Uso**:
```tsx
<Button variant="primary" size="md">
  Guardar
</Button>

<Button variant="outline" onClick={() => {}}>
  Cancelar
</Button>

<Button variant="danger" isLoading={loading}>
  Eliminar
</Button>
```

---

#### Card Component:

```tsx
// src/app/components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      "rounded-lg border border-border bg-card p-6 shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn("text-2xl font-semibold", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}
```

**Uso**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Estadísticas</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Contenido aquí</p>
  </CardContent>
</Card>
```

---

## Componentes Globales

### 🏠 DashboardLayout

**Ubicación**: `src/app/components/DashboardLayout.tsx`

**Propósito**: Layout principal que incluye sidebar, header y área de contenido

```tsx
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
}

export function DashboardLayout({ 
  children, 
  title, 
  showBackButton 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar para desktop */}
      <Sidebar className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64" />
      
      {/* Sidebar móvil */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Área principal */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center justify-between px-4 py-4">
            {/* Botón menú móvil */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Título */}
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            
            {/* Notificaciones */}
            <NotificacionesDropdown />
          </div>
        </header>
        
        {/* Contenido */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Características**:
- Sidebar fijo en desktop
- Sidebar deslizable en móvil
- Header sticky con notificaciones
- Responsive padding según tamaño de pantalla

---

### 📊 Sidebar

**Ubicación**: `src/app/components/Sidebar.tsx`

**Propósito**: Navegación lateral con enlaces por rol

```tsx
export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useUser();
  
  // Navegación según rol
  const navigation = getNavigationByRole(user?.rol);
  
  return (
    <div className={cn("flex flex-col bg-card border-r border-border", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <img src="/logo.svg" alt="Logo" className="h-8" />
        <span className="ml-2 text-lg font-bold">Banco Alimentos</span>
      </div>
      
      {/* Navegación */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Perfil */}
      <div className="border-t border-border p-4">
        <UserProfile user={user} />
      </div>
    </div>
  );
}

function getNavigationByRole(rol: string) {
  const navMap = {
    ADMINISTRADOR: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
      { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
      { name: 'Catálogo', href: '/admin/catalogo', icon: Package },
      { name: 'Reportes', href: '/admin/reportes', icon: BarChart },
    ],
    OPERADOR: [
      { name: 'Dashboard', href: '/operador/dashboard', icon: Home },
      { name: 'Donaciones', href: '/operador/donaciones', icon: Gift },
      { name: 'Solicitudes', href: '/operador/solicitudes', icon: FileText },
      { name: 'Inventario', href: '/operador/inventario', icon: Package },
      { name: 'Bajas', href: '/operador/bajas', icon: AlertTriangle },
    ],
    DONANTE: [
      { name: 'Dashboard', href: '/donante/dashboard', icon: Home },
      { name: 'Nueva Donación', href: '/donante/nueva-donacion', icon: Plus },
      { name: 'Mis Donaciones', href: '/donante/donaciones', icon: Gift },
      { name: 'Perfil', href: '/donante/perfil', icon: User },
    ],
    SOLICITANTE: [
      { name: 'Dashboard', href: '/user/dashboard', icon: Home },
      { name: 'Solicitar', href: '/user/formulario', icon: Plus },
      { name: 'Mis Solicitudes', href: '/user/solicitudes', icon: FileText },
      { name: 'Perfil', href: '/user/perfil', icon: User },
    ],
  };
  
  return navMap[rol] || navMap.SOLICITANTE;
}
```

---

### 🔔 NotificacionesDropdown

**Ubicación**: `src/app/components/NotificacionesDropdown.tsx`

**Propósito**: Mostrar notificaciones no leídas con badge

```tsx
'use client';

export function NotificacionesDropdown() {
  const [open, setOpen] = useState(false);
  const { notificaciones, loading, marcarComoLeida } = useNotificaciones();
  
  const noLeidas = notificaciones.filter(n => !n.leida);
  
  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md hover:bg-accent"
      >
        <Bell className="h-5 w-5" />
        
        {/* Badge con contador */}
        {noLeidas.length > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-error text-xs text-white">
            {noLeidas.length}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-card shadow-lg border border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Notificaciones</h3>
            <button onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">Cargando...</div>
            ) : noLeidas.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No hay notificaciones nuevas
              </div>
            ) : (
              noLeidas.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={() => marcarComoLeida(notif.id)}
                />
              ))
            )}
          </div>
          
          {/* Footer */}
          <div className="p-2 border-t border-border">
            <Link
              href="/notificaciones"
              className="block text-center text-sm text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Componentes por Módulo

### 📈 Módulo Admin: StatsCard

**Ubicación**: `src/modules/admin/shared/components/StatsCard.tsx`

**Propósito**: Tarjeta de estadística con icono y valor

```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, description }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        {/* Icono */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        
        {/* Contenido */}
        <div className="flex-1 ml-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          
          {/* Tendencia */}
          {trend && (
            <p className={cn(
              "text-xs flex items-center",
              trend.isPositive ? "text-success" : "text-error"
            )}>
              {trend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {trend.value}%
            </p>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Uso**:
```tsx
<StatsCard
  title="Total Donaciones"
  value={245}
  icon={Gift}
  trend={{ value: 12, isPositive: true }}
  description="Este mes"
/>
```

---

### 📊 Módulo Shared: DataTable

**Ubicación**: `src/modules/shared/components/tablas/DataTable.tsx`

**Propósito**: Tabla de datos genérica con ordenamiento, filtros y paginación

```tsx
interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  onRowClick,
  loading
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);
  
  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable && (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="ml-2"
                    >
                      {sortKey === column.key ? (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {sortedData.map((row) => (
            <tr
              key={String(row[keyField])}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "hover:bg-accent/50 transition-colors",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm">
                  {column.render 
                    ? column.render(row[column.key], row)
                    : String(row[column.key])
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {sortedData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay datos para mostrar
        </div>
      )}
    </div>
  );
}
```

**Uso**:
```tsx
<DataTable
  data={donaciones}
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'tipo_producto', label: 'Producto', sortable: true },
    { 
      key: 'cantidad', 
      label: 'Cantidad',
      render: (value, row) => `${value} ${row.unidad_nombre}`
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value) => <EstadoBadge estado={value} />
    }
  ]}
  keyField="id"
  onRowClick={(row) => router.push(`/admin/donaciones/${row.id}`)}
/>
```

---

## Hooks Personalizados

### 🎣 useNotificaciones

**Ubicación**: `src/modules/shared/hooks/useNotificaciones.ts`

**Propósito**: Gestión de notificaciones en tiempo real

```tsx
export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { user } = useUser();
  
  // Cargar notificaciones
  useEffect(() => {
    if (!user) return;
    
    async function cargarNotificaciones() {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .or(`destinatario_id.eq.${user.id},rol_destinatario.eq.${user.rol}`)
        .eq('activa', true)
        .order('fecha_creacion', { ascending: false });
      
      if (!error && data) {
        setNotificaciones(data);
      }
      setLoading(false);
    }
    
    cargarNotificaciones();
    
    // Polling cada 30 segundos
    const interval = setInterval(cargarNotificaciones, 30000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  // Marcar como leída
  const marcarComoLeida = async (notificacionId: string) => {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true, fecha_leida: new Date().toISOString() })
      .eq('id', notificacionId);
    
    if (!error) {
      setNotificaciones(prev =>
        prev.map(n => n.id === notificacionId ? { ...n, leida: true } : n)
      );
    }
  };
  
  return {
    notificaciones,
    loading,
    marcarComoLeida,
    noLeidas: notificaciones.filter(n => !n.leida).length
  };
}
```

---

### 🎣 useInventoryStock

**Ubicación**: `src/modules/user/hooks/useInventoryStock.ts`

**Propósito**: Verificar stock disponible en tiempo real

```tsx
export function useInventoryStock(productoId?: string) {
  const [stock, setStock] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    if (!productoId) return;
    
    async function fetchStock() {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('inventario')
        .select('cantidad_disponible')
        .eq('id_producto', productoId)
        .single();
      
      if (!error && data) {
        setStock(data.cantidad_disponible);
      }
      
      setLoading(false);
    }
    
    fetchStock();
  }, [productoId]);
  
  return { stock, loading };
}
```

---

## Gestión de Estado

### Server State vs Client State

El proyecto utiliza **Server Components** por defecto, minimizando la necesidad de gestión de estado global.

#### Server State (Por Defecto):

```tsx
// src/app/admin/dashboard/page.tsx
export default async function AdminDashboard() {
  // Datos obtenidos en el servidor
  const supabase = await createServerSupabaseClient();
  
  const { data: stats } = await supabase
    .from('donaciones')
    .select('count');
  
  // Renderizado en el servidor
  return (
    <DashboardLayout>
      <h1>Dashboard</h1>
      <p>Total donaciones: {stats[0].count}</p>
    </DashboardLayout>
  );
}
```

#### Client State (Cuando es Necesario):

```tsx
'use client';

export function FormularioSolicitud() {
  // Estado local del componente
  const [alimento, setAlimento] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Custom hook para lógica compartida
  const { stock } = useInventoryStock(alimento);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Enviar solicitud
    await crearSolicitud({ alimento, cantidad });
    
    setLoading(false);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario */}
    </form>
  );
}
```

---

## Tailwind CSS y Estilos

### 📦 Configuración de Tailwind

**Archivo**: `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        info: "hsl(var(--info))",
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

### 🎨 Utility Classes Personalizadas

**Archivo**: `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  /* Botones */
  .btn {
    @apply inline-flex items-center justify-center rounded-md font-medium transition-colors;
    @apply disabled:pointer-events-none disabled:opacity-50;
  }
  
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90;
  }
  
  /* Cards */
  .card {
    @apply rounded-lg border border-border bg-card shadow-sm;
  }
  
  /* Inputs */
  .input {
    @apply flex h-10 w-full rounded-md border border-input bg-background px-3 py-2;
    @apply text-sm ring-offset-background placeholder:text-muted-foreground;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring;
  }
  
  /* Estados */
  .badge-success {
    @apply inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success;
  }
  
  .badge-warning {
    @apply inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning;
  }
  
  .badge-error {
    @apply inline-flex items-center rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-semibold text-error;
  }
}
```

**Uso**:
```tsx
<button className="btn btn-primary">Guardar</button>
<input type="text" className="input" />
<span className="badge-success">Activo</span>
<span className="badge-error">Cancelado</span>
```

---

## Patrones de Diseño

### 1. **Composition Pattern**

Componentes pequeños que se combinan:

```tsx
// En lugar de un componente monolítico
<ComplexForm />

// Composición de componentes pequeños
<Form>
  <FormHeader title="Nueva Donación" />
  <FormSection title="Datos del Donante">
    <Input label="Nombre" />
    <Input label="Cédula" />
  </FormSection>
  <FormSection title="Alimentos">
    <SelectAlimento />
    <InputCantidad />
  </FormSection>
  <FormFooter>
    <Button variant="outline">Cancelar</Button>
    <Button variant="primary">Guardar</Button>
  </FormFooter>
</Form>
```

---

### 2. **Render Props Pattern**

Para compartir lógica entre componentes:

```tsx
<DataFetcher
  url="/api/donaciones"
  render={({ data, loading, error }) => {
    if (loading) return <Spinner />;
    if (error) return <Error message={error} />;
    return <DonacionesList data={data} />;
  }}
/>
```

---

### 3. **Container/Presentational Pattern**

Separación entre lógica y presentación:

```tsx
// Container (lógica)
function DonacionesContainer() {
  const { donaciones, loading } = useDonaciones();
  const [filtro, setFiltro] = useState('');
  
  const donacionesFiltradas = donaciones.filter(d =>
    d.tipo_producto.includes(filtro)
  );
  
  return (
    <DonacionesList
      donaciones={donacionesFiltradas}
      loading={loading}
      onFilterChange={setFiltro}
    />
  );
}

// Presentational (UI)
function DonacionesList({ donaciones, loading, onFilterChange }) {
  return (
    <div>
      <SearchInput onChange={onFilterChange} />
      {loading ? <Spinner /> : (
        <ul>
          {donaciones.map(d => <DonacionItem key={d.id} donacion={d} />)}
        </ul>
      )}
    </div>
  );
}
```

---

## Conclusión

El frontend del Banco de Alimentos ULEAM está construido con:

- ✅ **Componentes modulares y reutilizables**
- ✅ **Sistema de diseño consistente con Tailwind CSS**
- ✅ **Server Components por defecto para mejor performance**
- ✅ **Hooks personalizados para lógica compartida**
- ✅ **Tipado estricto con TypeScript**
- ✅ **Responsive design mobile-first**
- ✅ **Accesibilidad con semántica HTML**

Esta arquitectura permite:
- Desarrollo rápido con componentes reutilizables
- Mantenimiento sencillo con código organizado
- Escalabilidad agregando nuevos componentes
- Consistencia visual en toda la aplicación
- Performance óptimo con SSR y Client Components selectivos
