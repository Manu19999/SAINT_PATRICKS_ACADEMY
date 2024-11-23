import {
  cilSpeedometer,
  cilPeople,
  cilTask,
  cilClipboard,
  cilListRich,
  cilSchool,
  cilBook,
  cilCalendar,
  cilPencil,
  cilChartLine,
  cilFile,
  cilBookmark,
  cilDollar,
  cilGraph,
  cilUser,
} from '@coreui/icons';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';

const _nav = [
  {
    component: CNavItem,
    name: 'Panel de control',
    to: '/PaginaPrincipal',
    icon: cilSpeedometer,
    nameobject: 'PaginaPrincipal',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: cilSpeedometer,
    nameobject: 'Dashboard',
  },
  {
    component: CNavItem,
    name: 'Matrícula',
    to: '/matricula', // La ruta que deseas para la matrícula
    nameobject: 'navMatricula',

    icon: cilSchool,
  },
  {
    component: CNavItem,
    name: 'Asistencia',
    to: '/ListaAsistencia',
    icon: cilClipboard,
    nameobject: 'navAsistencia',
  },
  {
    component: CNavItem,
    name: 'Asistencia',
    to: '/ListaAsistenciaProfesor',
    icon: cilClipboard,
    nameobject: 'navAsistenciaProfesor',
  },
  {
    component: CNavItem,
    name: 'Profesores',
    to: '/ListaProfesores',
    icon: cilPeople,
    nameobject: 'navProfesores',
  },
  {
    component: CNavItem,
    name: 'Actividades académicas',
    to: '/ListaActividadesAca',
    icon: cilTask,
    nameobject: 'navActividadesAcademicas',
  },
  
  {
    component: CNavItem,
    name: 'Actividades extracurriculares',
    to: '/actividades',
    icon: cilSchool,
    nameobject: 'navListaActividades',
  },
  {
    component: CNavItem,
    name: 'Notas',
    to: '/ListaEstadonota',
    icon: cilFile,
    nameobject: 'navNotas',
  },
    {
     component: CNavItem,
     name: 'Secciones asignaturas',
     to: '/ListaSecciones_Asignatura',
     icon: cilFile,
    nameobject: 'navListaSecciones_Asignaturas',
    },
    {
      component: CNavItem,
      name: 'Solicitudes Padres',
      to: '/Solicitud',
      icon: cilCalendar, 
      
    },
    {
      component: CNavItem,
      name: 'Solicitudes Admin',
      to: '/Solicitud_admin',
      icon: cilCalendar, 
      
    },
  {
    component: CNavGroup,
    name: 'Mantenimientos',
    icon: cilListRich,
    nameobject: 'navMantenimientos',
    items: [
      {
        component: CNavItem,
        name: 'Asignaturas',
        to: '/ListaAsignaturas',
        nameobject: 'navAsignaturas',
      },
      {
        component: CNavItem,
        name: 'Ciclos',
        to: '/ListaCiclos',
        nameobject: 'navCiclos',
      },
      {
        component: CNavItem,
        name: 'Especialidades',
        to: '/ListaEspecialidades',
        nameobject: 'navEspecialidades',
      },
      {
        component: CNavItem,
        name: 'Estado asistencia',
        to: '/ListaEstadoasistencia',
        nameobject: 'navEstadoAsistencia',
      },
      {
        component: CNavItem,
        name: 'Estado nota',
        to: '/ListaEstadonota',
        nameobject: 'navEstadoNota',
      },
      {
        component: CNavItem,
        name: 'Grados',
        to: '/ListaGrados',
        nameobject: 'navGrados',
      },
      {
        component: CNavItem,
        name: 'Grado académico',
        to: '/ListaGradoAcademico',
        nameobject: 'navGradoAcademico',
      },
      {
        component: CNavItem,
        name: 'Parciales',
        to: '/ListaParciales',
        nameobject: 'navParciales',
      },
      {
        component: CNavItem,
        name: 'Ponderaciones',
        to: '/ListaPonderaciones',
        nameobject: 'navPonderaciones',
      },
      {
        component: CNavItem,
        name: 'Tipo de contrato',
        to: '/ListaTipoContrato',
        nameobject: 'navTipoContrato',
      },
      {
        component: CNavItem,
        name: 'Historial Academico',
        to: '/ListaHistoriales',
        nameobject: 'navHistorialAcademico',
      },
      {
        component: CNavItem,
        name: 'Tipo matricula',
        to: '/tipomatricula',
        nameobject: 'navTipoMatricula',
      },
      {
        component: CNavItem,
        name: 'Periodo matricula',
        to: '/periodomatricula',
        nameobject: 'navPeriodoMatricula',
      },
      {
        component: CNavItem,
        name: 'Estado matricula',
        to: '/estadomatricula',
        nameobject: 'navEstadoMatricula',
      },
      {
        component: CNavItem,
        name: 'Concepto pago',
        to: '/conceptopago',
        nameobject: 'navConceptoPago',
      },
      {
        component: CNavItem,
        name: 'Edificios',
        to: '/edificios',
        nameobject: 'navEdificios',
      },
      {
        component: CNavItem,
        name: 'Aulas',
        to: '/pages/matricula/ListaAulas',
        nameobject: 'navAulas',
      },
      {
        component: CNavItem,
        name: 'Dias',
        to: '/dias',
        nameobject: 'navDias',
      },
     {
        component: CNavItem,
        name: 'Cuentas Contables',
        to: '/Contabilidad',
        nameobject: 'navCuentasContables',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Contabilidad y Pagos',
    icon: cilDollar,
    nameobject: 'navContabilidadYPagos',
    items: [
      {
        component: CNavItem,
        name: 'Pagos Matricula',
        to: '/ListaPagosMatricula',
        nameobject: 'navPagosMatricula',
      },
      {
        component: CNavItem,
        name: 'Historial de Pagos Mensuales',
        to: '/HistorialPagosMensuales',
        nameobject: 'navHistorialPagosMensuales',
      },
      {
        component: CNavItem,
        name: 'Libro Diario',
        to: '/LibroDiario',
        nameobject: 'navLibroDiario',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Personas',
    icon: cilUser,
    nameobject: 'navPersonas',
    items: [
      {
        component: CNavItem,
        name: 'Personas',
        to: '/ListaPersonas',
        nameobject: 'navPersonasList',
      },
      {
        component: CNavItem,
        name: 'Familias',
        to: '/ListaEstructura',
        nameobject: 'navFamilias',
      },
      {
        component: CNavItem,
        name: 'Estructuras',
        to: '/ListaEstructura',
        nameobject: 'navEstructuras',
      },
      {
        component: CNavItem,
        name: 'Tipo de Relaciones',
        to: 'ListaRelacion',
        nameobject: 'navTipoRelaciones',
      },
      {
        component: CNavItem,
        name: 'Tipo persona',
        to: '/tipopersona',
        nameobject: 'navTipoPersona',
      },{
        component: CNavItem,
        name: 'Historial Procedencia',
        to: '/ListaHistoricoProc',
        nameobject: 'navHistorialProcedencia',
      },
      {
        component: CNavItem,
        name: 'Departamento',
        to: '/departamento',
        nameobject: 'navDepartamento',
      },

      {
        component: CNavItem,
        name: 'Municipios',
        to: '/municipios',
        nameobject: 'navMunicipios',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reportes de Bitácora',
    icon: cilGraph,
    nameobject: 'navReportesBitacora',
    items: [
      {
        component: CNavItem,
        name: 'Actividades del Sistema',
        to: '/ReporteActividades',
        nameobject: 'navActividadesSistema',
      },
      {
        component: CNavItem,
        name: 'Historial de Inicios de Sesión',
        to: '/ReporteIniciosSesion',
        nameobject: 'navIniciosSesion',
      },
      {
        component: CNavItem,
        name: 'Cambios en Datos',
        to: '/ReporteCambiosDatos',
        nameobject: 'navCambiosDatos',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Administrador de Usuarios',
    icon: cilUser,
    nameobject: 'navAdministradorUsuarios',
    items: [
      {
        component: CNavItem,
        name: 'Usuarios',
        to: '/UserMagnament',
        nameobject: 'navUsuarios',
      },
      {
        component: CNavItem,
        name: 'Permisos',
        to: '/rolesandpermissions',
        nameobject: 'navPermisos',
      },
    ],
  },
];

export default _nav;
