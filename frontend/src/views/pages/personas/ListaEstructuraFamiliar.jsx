import React, { useState, useEffect } from 'react'
import { CIcon } from '@coreui/icons-react'
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilDescription, cilArrowLeft } from '@coreui/icons'
import swal from 'sweetalert2' // Importar SweetAlert
import axios from 'axios'
import { jsPDF } from 'jspdf' // Para generar archivos PDF
import 'jspdf-autotable' // Para crear tablas en los archivos PDF
import * as XLSX from 'xlsx' // Para generar archivos Excel
import { saveAs } from 'file-saver' // Para descargar archivos en el navegador
import Select from 'react-select' // Para crear un seleccionador dinamico
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import {
  CContainer,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormLabel,
  CFormSelect,
  CRow,
  CCol,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'

import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const ListaEstructura = () => {

  const { canSelect, canDelete, canInsert, canUpdate } = usePermission('ListaEstructura');

  // Estados principales
  const [estructuraFamiliar, setEstructuraFamiliar] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaEstructura, setNuevaEstructuraFamiliar] = useState({
    cod_persona_padre: '',
    cod_persona_estudiante: '',
    cod_tipo_relacion: '',
    descripcion: '',
  });
  const [personas, setPersonas] = useState([]);
  const [personasFiltradas, setPersonasFiltradas] = useState([]);
  const [tipoRelacion, setTipoRelacion] = useState([]);
  const [buscadorRelacion, setBuscadorRelacion] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [rolActual, setRolActual] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [codPersonaEstudiante, setCodPersonaEstudiante] = useState('');
  const [codPersonaPadre, setCodPersonaPadre] = useState('');
  const [buscadorRelacionEstudiante, setBuscadorRelacionEstudiante] = useState('');
  const [buscadorRelacionPadre, setBuscadorRelacionPadre] = useState('');
  const [personasFiltradasEstudiante, setPersonasFiltradasEstudiante] = useState([]);
  const [personasFiltradasPadre, setPersonasFiltradasPadre] = useState([]);
  const [isDropdownOpenEstudiante, setIsDropdownOpenEstudiante] = useState(false);
  const [isDropdownOpenPadre, setIsDropdownOpenPadre] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [estructurasFamiliares, setEstructurasFamiliares] = useState([]);

  



  // Navegación y ubicación
  const location = useLocation();
  const navigate = useNavigate();
  const { personaSeleccionada } = location?.state || {};

  // Asignar rol basado en persona seleccionada
  useEffect(() => {
    if (personaSeleccionada) {
      setRolActual(personaSeleccionada.cod_tipo_persona === 1 ? 'ESTUDIANTE' : 'PADRE');
    }
  }, [personaSeleccionada]);


{/* ------------------------------------------------------------------------------------------------------------------------------------------------- */}

  useEffect(() => {
    if (personaSeleccionada) {
      const cargarEstructurasFamiliares = async () => {
        const respuesta = await fetch(`http://localhost:4000/api/estructuraFamiliar/verEstructuraFamiliar/${personaSeleccionada.cod_persona}`);
        const datos = await respuesta.json();
        setEstructurasFamiliares(datos);
      };
      cargarEstructurasFamiliares();
    }
  }, [personaSeleccionada]);

  useEffect(() => {
    if (modalVisible === false && personaSeleccionada) {
      // Cargar de nuevo las estructuras familiares cuando se cierra el modal y se ha añadido una nueva estructura.
      const cargarEstructurasFamiliares = async () => {
        const respuesta = await fetch(`http://localhost:4000/api/estructuraFamiliar/verEstructuraFamiliar/${personaSeleccionada.cod_persona}`);
        const datos = await respuesta.json();
        setEstructurasFamiliares(datos);
      };
      cargarEstructurasFamiliares();
    }
  }, [modalVisible, personaSeleccionada]);
  
{/* -------------------------------------------------------------------------------------------------------------------------------------------- */}


  // Cargar datos iniciales
  useEffect(() => {
    const cargarPersonas = async () => {
      const respuesta = await fetch('http://localhost:4000/api/estructuraFamiliar/verPersonas');
      const datos = await respuesta.json();
      setPersonas(datos);
    };
    cargarPersonas();
  }, []);

  // Filtrar personas para el buscador
  useEffect(() => {
    const resultados = personas.filter(
      (persona) =>
        persona.fullName?.toLowerCase().includes(buscadorRelacion.toLowerCase()) ||
        persona.dni_persona?.includes(buscadorRelacion)
    );
    setPersonasFiltradas(resultados);
    setIsDropdownOpen(buscadorRelacion.length > 0 && resultados.length > 0);
  }, [buscadorRelacion, personas]);

  // Manejar búsqueda y selección de personas
  const handleBuscarRelacion = (event) => {
    setBuscadorRelacion(event.target.value);
  };

  const handleSeleccionarPersona = (persona) => {
    if (rolActual === 'ESTUDIANTE') {
      setNuevaEstructuraFamiliar((prev) => ({
        ...prev,
        cod_persona_estudiante: persona.cod_persona,
        cod_persona_padre: prev.cod_persona_padre, // Mantener el valor actual del padre
      }));
    } else if (rolActual === 'PADRE') {
      setNuevaEstructuraFamiliar((prev) => ({
        ...prev,
        cod_persona_padre: persona.cod_persona,
        cod_persona_estudiante: prev.cod_persona_estudiante, // Mantener el valor actual del estudiante
      }));
    }
  
    setBuscadorRelacion(`${persona.dni_persona} - ${persona.fullName}`);
    setIsDropdownOpen(false);
  };
  
{/* ------------------------------------------------------------------------------------------------------------------------------------- */}

const handleBuscarRelacionEstudiante = (e) => {
  const filtro = e.target.value.toLowerCase();
  setBuscadorRelacionEstudiante(filtro);

  if (filtro.trim() === '') {
    setPersonasFiltradasEstudiante([]);
    setIsDropdownOpenEstudiante(false);
    return;
  }

  const filtradas = personas.filter(persona =>
    (persona.fullName && persona.fullName.toLowerCase().includes(filtro)) ||
    (persona.dni_persona && persona.dni_persona.includes(filtro))
  );

  setPersonasFiltradasEstudiante(filtradas);
  setIsDropdownOpenEstudiante(filtradas.length > 0);
};

const handleSeleccionarPersonaEstudiante = (persona) => {
  setCodPersonaEstudiante(persona.cod_persona);
  setNuevaEstructuraFamiliar(prev => ({
    ...prev,
    cod_persona_estudiante: persona.cod_persona,
  }));
  setIsDropdownOpenEstudiante(false);
  setBuscadorRelacionEstudiante(`${persona.dni_persona} - ${persona.fullName}`);
};

const handleBuscarRelacionPadre = (e) => {
  const filtro = e.target.value.toLowerCase();
  setBuscadorRelacionPadre(filtro);

  if (filtro.trim() === '') {
    setPersonasFiltradasPadre([]);
    setIsDropdownOpenPadre(false);
    return;
  }

  const filtradas = personas.filter(persona =>
    (persona.fullName && persona.fullName.toLowerCase().includes(filtro)) ||
    (persona.dni_persona && persona.dni_persona.includes(filtro))
  );

  setPersonasFiltradasPadre(filtradas);
  setIsDropdownOpenPadre(filtradas.length > 0);
};

const handleSeleccionarPersonaPadre = (persona) => {
  setCodPersonaPadre(persona.cod_persona);
  setNuevaEstructuraFamiliar(prev => ({
    ...prev,
    cod_persona_padre: persona.cod_persona,
  }));
  setIsDropdownOpenPadre(false);
  setBuscadorRelacionPadre(`${persona.dni_persona} - ${persona.fullName}`);
};


{/* ----------------------------------------------------------------------------------------------------------------------------------------*/}

  // Manejar envío del formulario
  const handleSubmit = () => {
    const nuevaEstructuraFinal = {
      ...nuevaEstructura,
      cod_persona_padre:
        rolActual === 'PADRE'
          ? personaSeleccionada?.cod_persona
          : nuevaEstructura.cod_persona_padre,
      cod_persona_estudiante:
        rolActual === 'ESTUDIANTE'
          ? personaSeleccionada?.cod_persona
          : nuevaEstructura.cod_persona_estudiante,
    };
  
    console.log("Estructura familiar final:", nuevaEstructuraFinal);
  
    // Llamar a handleCreateEstructura con la nueva estructura
    handleCreateEstructura(nuevaEstructuraFinal);
  };
  

  // Resetear formulario
  const resetNuevaEstructuraFamiliar = () => {
    setNuevaEstructuraFamiliar({
      cod_persona_padre: rolActual === 'PADRE' ? personaSeleccionada?.cod_persona || '' : '',
      cod_persona_estudiante: rolActual === 'ESTUDIANTE' ? personaSeleccionada?.cod_persona || '' : '',
      cod_tipo_relacion: '',
      descripcion: '',
    });
    setBuscadorRelacion('');
  };
  

  // Efecto para limpiar el modal al abrirlo
  useEffect(() => {
    if (modalVisible) {
      resetNuevaEstructuraFamiliar();
    }
  }, [modalVisible]);

  useEffect(() => {
    const fetchTipoRelacion = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/estructuraFamiliar/verTipoRelacion`,
        )
        setTipoRelacion(response.data)
        console.log('Datos de tipo Relacion:', response.data) // Verifica la estructura de los datos
      } catch (error) {
        console.error('Error al cargar tipos de relación:', error)
      }
    }
    fetchTipoRelacion()
  }, [])
  {/*  */}

  {/* ------------------------------------------------------------------------------------------------------------------------------------- */}

  {/* Función para mostrar la estructura familiar  */}
  const fetchEstructuraFamiliar = async () => {
    try {
      const response = await fetch(
        'http://localhost:4000/api/estructuraFamiliar/verEstructuraFamiliar',
      )
      const data = await response.json()
      console.log(data)

      // Verifica que 'data' sea un array antes de intentar mapearlo
      if (Array.isArray(data)) {
        const dataWithIndex = data.map((estructura, index) => ({
          ...estructura,
          originalIndex: index + 1, // Agrega un índice original a cada estructura
        }))
        console.log(dataWithIndex)
        setEstructuraFamiliar(dataWithIndex) // Actualiza el estado con los datos modificados
      } else {
        console.error('La respuesta no es un array:', data) 
      }
    } catch (error) {
      console.error('Error al obtener la estructura familiar:', error)
    }
  }

{/* ----------------------------------------------------------------------------------------------------------------------------------------- */}

 {/* Función para crear estructura */}
 const handleCreateEstructura = async () => {
  console.log("Estructura familiar final:", nuevaEstructura);

  // Validación de descripción obligatoria
  if (!nuevaEstructura.descripcion.trim()) {
    swal.fire({
      icon: 'warning',
      title: 'Campo obligatorio',
      text: 'La descripción no puede estar vacía.',
    });
    return;
  }

  // Validación de cod_persona_padre y cod_persona_estudiante
  if (!nuevaEstructura.cod_persona_padre && !nuevaEstructura.cod_persona_estudiante) {
    swal.fire({
      icon: 'warning',
      title: 'Campos obligatorios',
      text: 'Debe seleccionar al menos un padre o estudiante.',
    });
    return;
  }

  // Log para depuración
  console.log('Datos enviados al backend:', nuevaEstructura);

  try {
    // Preparación del cuerpo de la solicitud
    const estructuraData = {
      cod_persona_padre: nuevaEstructura.cod_persona_padre || null, // Permitir null si no está definido
      cod_persona_estudiante: nuevaEstructura.cod_persona_estudiante || null, // Permitir null si no está definido
      cod_tipo_relacion: nuevaEstructura.cod_tipo_relacion,
      descripcion: nuevaEstructura.descripcion,
    };

    const response = await fetch('http://localhost:4000/api/estructuraFamiliar/crearEstructuraFamiliar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estructuraData),
    });

    if (response.ok) {
      // Éxito: Actualizar datos y cerrar el modal
      fetchEstructuraFamiliar(); // Actualizar la lista de estructuras familiares
      setModalVisible(false); // Cerrar el modal
      resetNuevaEstructuraFamiliar(); // Reiniciar formulario
      setHasUnsavedChanges(false); // Reiniciar control de cambios no guardados
      swal.fire({
        icon: 'success',
        title: 'Creación exitosa',
        text: 'La estructura ha sido creada correctamente.',
      });
    } else {
      // Error en la respuesta del servidor
      const errorData = await response.json();
      swal.fire({
        icon: 'error',
        title: 'Error al crear',
        text: errorData.message || 'No se pudo crear la estructura.',
      });
    }
  } catch (error) {
    // Error de conexión o fetch
    console.error('Error al crear la estructura:', error);
    swal.fire({
      icon: 'error',
      title: 'Error de conexión',
      text: 'Hubo un problema al conectar con el servidor.',
    });
  }
};


  
{/* ---------------------------------------------------------------------------------------------------------------------------------------------- */}

{/* Función para actualizar estructura */}
const handleUpdateEstructura = async () => {
    const descripcionCapitalizado = capitalizeWords(estructuraToUpdate.descripcion.trim().replace(/\s+/g, ' '));

    if (!estructuraToUpdate.descripcion.trim()) { // Verificar si la descripción está vacía
      swal.fire({
        icon: 'warning',
        title: 'Campo obligatorio',
        text: 'La descripción no puede estar vacía.',
      });
      return; // Detener la función si está vacía
    } 
    if (!validateDescripcion(descripcionCapitalizado)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/estructuraFamiliar/actualizarEstructuraFamiliar/${estructuraToUpdate.Cod_genealogia}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          descripcion: descripcionCapitalizado, 
          cod_persona_padre: estructuraToUpdate.cod_persona_padre, 
          cod_persona_estudiante: estructuraToUpdate.cod_persona_estudiante, 
          cod_tipo_relacion: estructuraToUpdate.cod_tipo_relacion
       })
      });

      if (response.ok) {
        fetchEstructuraFamiliar();
        setModalUpdateVisible(false); // Cerrar el modal sin advertencia al guardar
        resetEstructuraToUpdate();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        swal.fire({
          icon: 'success',
          title: 'Actualización exitosa',
          text: 'La estructura familiar ha sido actualizado correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el la estructura familiar.',
        });
      }
    } catch (error) {
      console.error('Error al actualizar la estructura familiar:', error);
    }
  };

  {/* Fin de la función para actualizar estructura */}

{/* ---------------------------------------------------------------------------------------------------------------------------------------------------- */}
  
{/* Función para borrar estructura */}
  const handleDeleteEstructura = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/estructuraFamiliar/eliminarEstructuraFamiliar/${encodeURIComponent(estructuraToDelete.Cod_genealogia)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        fetchEstructuraFamiliar();
        setModalDeleteVisible(false);
        setEdificioToDelete({});
        swal.fire({
          icon: 'success',
          title: 'Eliminación exitosa',
          text: 'La estructura familiar ha sido eliminado correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la estructura familiar.',
        });
      }
    } catch (error) {
      console.error('Error al eliminar la estructura familiar:', error);
    }
  };
  {/*Fin de la función para borrar estructura*/}

{/* ------------------------------------------------------------------------------------------------------------------------------- */}


const handleCloseModal = (closeFunction, resetFields) => {
  if (hasUnsavedChanges) {
    swal.fire({
      title: '¿Estás seguro?',
      text: 'Si cierras este formulario, perderás todos los datos ingresados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        closeFunction(false);
        resetFields(); // Limpiar los campos al cerrar
        setHasUnsavedChanges(false); // Resetear cambios no guardados
      }
    });
  } else {
    closeFunction(false);
    resetFields();
  }
};



const openUpdateModal = (estructura) => {
  setEstructuraToUpdate(estructura);
  setModalUpdateVisible(true);
  setHasUnsavedChanges(false);
};

const openDeleteModal = (estructura) => {
  setEstructuraToDelete(estructura);
  setModalDeleteVisible(true);
}

const handleSearch = (event) => {
  setSearchTerm(event.target.value);
  setCurrentPage(1);
};
const disableCopyPaste = (e) => {
  e.preventDefault();
  swal.fire({
    icon: 'warning',
    title: 'Acción bloqueada',
    text: 'Copiar y pegar no está permitido.',
  });
};


  const handleModalOpen = () => {
    setModalVisible(true);
  };
  
  const handleModalClose = () => {
    setModalVisible(false);
  };

  const volverAListaPersonas = () => {
    navigate('/ListaPersonas');
  };


  const filteredEstructuraFamiliar = estructuraFamiliar.filter(
    (estructura) =>
      estructura.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estructura.cod_persona_estudiante?.toString().includes(searchTerm) || // Assuming cod_persona_estudiante is a number
      estructura.cod_persona_padre?.toString().includes(searchTerm) ||
      estructura.cod_tipo_relacion?.toString().includes(searchTerm),
  )

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredEstructuraFamiliar.slice(indexOfFirstRecord, indexOfLastRecord)

{/* -------------------------------------------------------------------------------------------------------------------------------- */}
  
    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }
    


return (
    <CContainer>
      <CRow className="align-items-center mb-5">
        <CCol xs="8" md="9">
          {/* Título de la página */}
          <h1 className="mb-0">Estructura Familiar</h1>
        </CCol>
        
        <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
  <CButton color="secondary" onClick={volverAListaPersonas} style={{ marginRight: '10px', minWidth: '120px' }}>
    <CIcon icon={cilArrowLeft} /> Personas 
  </CButton>
  <CButton
        style={{ backgroundColor: '#4B6251', color: 'white', minWidth: '120px' }}
        className="mb-3 mb-md-0 me-md-3"
        onClick={handleModalOpen} // Abre el modal al hacer clic
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>
  <CDropdown>
    <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white', minWidth: '120px' }}>
      Reportes
    </CDropdownToggle>
    <CDropdownMenu></CDropdownMenu>
  </CDropdown>
</CCol>

      </CRow>

      {/* Contenedor de la barra de búsqueda y el selector dinámico */}
      <CRow className="align-items-center mt-4 mb-2">
        {/* Barra de búsqueda  */}
        <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
          <CInputGroup className="me-3" style={{ width: '450px' }}>
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput placeholder="Buscar estructura..." value={searchTerm} />
            <CButton
              style={{
                border: '1px solid #ccc',
                transition: 'all 0.01s ease-in-out', // Duración de la transición
                backgroundColor: '#F3F4F7', // Color por defecto
                color: '#343a40', // Color de texto por defecto
              }}
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E0E0E0' // Color cuando el mouse sobre el boton "limpiar"
                e.currentTarget.style.color = 'black' // Color del texto cuando el mouse sobre el boton "limpiar"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F7' // Color cuando el mouse no está sobre el boton "limpiar"
                e.currentTarget.style.color = '#343a40' // Color de texto cuando el mouse no está sobre el boton "limpiar"
              }}
            >
              <CIcon icon={cilBrushAlt} /> Limpiar
            </CButton>
          </CInputGroup>
        </CCol>

        {/* Selector dinámico a la par de la barra de búsqueda */}
        <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
          <CInputGroup className="mt-2 mt-md-0" style={{ width: 'auto', display: 'inline-block' }}>
            <div className="d-inline-flex align-items-center">
              <span>Mostrar&nbsp;</span>
              <CFormSelect
                style={{ width: '80px', display: 'inline-block', textAlign: 'center' }}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setRecordsPerPage(value)
                  setCurrentPage(1) // Reiniciar a la primera página cuando se cambia el número de registros
                }}
                value={recordsPerPage}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </CFormSelect>
              <span>&nbsp;registros</span>
            </div>
          </CInputGroup>
        </CCol>
      </CRow>

      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '500px' }}>
  <CTable striped>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">#</CTableHeaderCell>
        {rolActual === 'ESTUDIANTE' ? (
          <>
            <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Estudiante</CTableHeaderCell>
            <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Padre/Tutor</CTableHeaderCell>
          </>
        ) : (
          <>
            <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Padre/Tutor</CTableHeaderCell>
            <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Estudiante</CTableHeaderCell>
          </>
        )}
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Tipo Relación</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Descripción</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {estructurasFamiliares.length > 0 ? (
        estructurasFamiliares.map((estructura, index) => (
          <CTableRow key={estructura.cod_estructura}>
            <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{index + 1}</CTableDataCell>
            {rolActual === 'ESTUDIANTE' ? (
              <>
                {/* Estudiante */}
                <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                  {`${personas.find(p => p.cod_persona === estructura.cod_persona_estudiante)?.fullName?.toUpperCase() || 'N/A'}`}
                </CTableDataCell>
                {/* Padre/Tutor */}
                <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                  {personas.find(p => p.cod_persona === estructura.cod_persona_padre)?.fullName?.toUpperCase() || 'N/A'}
                </CTableDataCell>
              </>
            ) : (
              <>
                {/* Padre/Tutor */}
                <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                  {personas.find(p => p.cod_persona === estructura.cod_persona_padre)?.fullName?.toUpperCase() || 'N/A'}
                </CTableDataCell>
                {/* Estudiante */}
                <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                  {`${personas.find(p => p.cod_persona === estructura.cod_persona_estudiante)?.fullName?.toUpperCase() || 'N/A'}`}
                </CTableDataCell>
              </>
            )}
            {/* Tipo de Relación */}
            <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
              {tipoRelacion.find(tipo => tipo.Cod_tipo_relacion === estructura.cod_tipo_relacion)?.tipo_relacion?.toUpperCase() || 'N/A'}
            </CTableDataCell>
            {/* Descripción */}
            <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
              {estructura.descripcion.toUpperCase()}
            </CTableDataCell>
            <CTableDataCell className="text-center">
              <div className="d-flex justify-content-center">


              {canUpdate && (
                <CButton
                  color="warning"
                  onClick={() => openUpdateModal(estructura)}
                  style={{ marginRight: '10px' }}
                >
                  <CIcon icon={cilPen} />
                </CButton>

              )}

{canDelete && (
                <CButton color="danger" onClick={() => openDeleteModal(estructura)}>
                  <CIcon icon={cilTrash} />
                </CButton>
)}
              </div>
            </CTableDataCell>
          </CTableRow>
        ))
      ) : (
        <CTableRow>
          <CTableDataCell colSpan="6" className="text-center">No hay estructuras familiares para esta persona.</CTableDataCell>
        </CTableRow>
      )}
    </CTableBody>
  </CTable>
</div>


<CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
  <CModalHeader closeButton>
    <CModalTitle>Nueva Estructura Familiar</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm>

      {/* Campo oculto para cod_persona_estudiante */}
      <input type="hidden" name="cod_persona_estudiante" value={codPersonaEstudiante} />

      {/* Campo oculto para cod_persona_padre */}
      <input type="hidden" name="cod_persona_padre" value={codPersonaPadre} />

      {/* Campo de búsqueda para Estudiante */}
      <div className="mb-3">
        <CInputGroup className="mb-3">
          <CInputGroupText>
            Estudiante
          </CInputGroupText>
          <CFormInput
            type="text"
            value={buscadorRelacionEstudiante}
            onChange={handleBuscarRelacionEstudiante}
            placeholder="Buscar por DNI o nombre"
          />
          <CButton type="button">
            <CIcon icon={cilSearch} />
          </CButton>
        </CInputGroup>

        {isDropdownOpenEstudiante && personasFiltradasEstudiante.length > 0 && (
          <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, width: '100%' }}>
            {personasFiltradasEstudiante.map(persona => (
              <div
                key={persona.cod_persona}
                className="dropdown-item"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSeleccionarPersonaEstudiante(persona)}
              >
                {persona.dni_persona} - {persona.fullName}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campo de búsqueda para Padre/Tutor */}
      <div className="mb-3">
        <CInputGroup className="mb-3">
          <CInputGroupText>
            Padre/Tutor
          </CInputGroupText>
          <CFormInput
            type="text"
            value={buscadorRelacionPadre}
            onChange={handleBuscarRelacionPadre}
            placeholder="Buscar por DNI o nombre"
          />
          <CButton type="button">
            <CIcon icon={cilSearch} />
          </CButton>
        </CInputGroup>

        {isDropdownOpenPadre && personasFiltradasPadre.length > 0 && (
          <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, width: '100%' }}>
            {personasFiltradasPadre.map(persona => (
              <div
                key={persona.cod_persona}
                className="dropdown-item"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSeleccionarPersonaPadre(persona)}
              >
                {persona.dni_persona} - {persona.fullName}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selector de Tipo Relación */}
      <CInputGroup className="mt-3">
        <CInputGroupText>Tipo Relación</CInputGroupText>
        <CFormSelect
          value={nuevaEstructura.cod_tipo_relacion}
          onChange={e => setNuevaEstructuraFamiliar(prev => ({
            ...prev,
            cod_tipo_relacion: e.target.value,
          }))}
        >
          <option value="">Tipo de Relación</option>
          {tipoRelacion.map(tipo => (
            <option key={tipo.Cod_tipo_relacion} value={tipo.Cod_tipo_relacion}>
              {tipo.tipo_relacion.toUpperCase()}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>

      {/* Campo de Descripción */}
      <CInputGroup className="mt-3">
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
          type="text"
          value={nuevaEstructura.descripcion}
          onChange={e => setNuevaEstructuraFamiliar(prev => ({
            ...prev,
            descripcion: e.target.value,
          }))}
          placeholder="Descripción de la relación"
        />
      </CInputGroup>
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalVisible(false)}>Cerrar</CButton>
    <CButton color="primary" onClick={handleCreateEstructura}>Guardar</CButton>
  </CModalFooter>
</CModal>

    </CContainer>
  )
}
export default ListaEstructura