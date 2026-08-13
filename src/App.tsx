import React, { useState } from "react";
import "./index.css";

// tipos
import type { View, Company, AsientoContable, Articulo, MovimientoInventario, Bodega, CategoriaInventario, ProveedorInventario, OrdenCompra, Factura, ProveedorArticulo, DocumentoProveedor, Recepcion, EvaluacionServicio, DevolucionProveedor, SolicitudCotizacion, OfertaProveedor, AuditoriaProveedor, AuditoriaOC } from "./types";

// datos
import { COLABORADORES_INIT } from "./data/colaboradores";
import { CATALOGOS_INIT } from "./data/catalogos";
import { COMPANIES } from "./data/empresas";
import { ASIENTOS_INIT, FACTURAS_CXP_INIT } from "./data/finanzas";
import { ARTICULOS_INIT, MOVIMIENTOS_INIT, BODEGAS_INIT, CATEGORIAS_INIT, PROVEEDORES_INIT } from "./data/inventario";
import { ORDENES_COMPRA_INIT, PROVEEDOR_ARTICULO_INIT, DOCUMENTOS_PROVEEDOR_INIT, RECEPCIONES_INIT } from "./data/proveeduria";

// componentes compartidos
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { LoginScreen } from "./components/LoginScreen";
import { CompanySelector } from "./components/LoginScreen";

// módulos — inventario
import { InventarioHome }      from "./modules/inventario/InventarioHome";
import { ConsultaExistencias } from "./modules/inventario/ConsultaExistencias";
import { NuevoArticulo }       from "./modules/inventario/NuevoArticulo";
import { EntradasSalidas }     from "./modules/inventario/EntradasSalidas";
import { RegistrarIngreso }    from "./modules/inventario/RegistrarIngreso";
import { RegistrarSalida }     from "./modules/inventario/RegistrarSalida";
import { TrasladoBodegas }     from "./modules/inventario/TrasladoBodegas";
import { AjusteInventario }    from "./modules/inventario/AjusteInventario";
import { BajaDescarte }        from "./modules/inventario/BajaDescarte";
import { ConteoAuditoria }     from "./modules/inventario/ConteoAuditoria";
import { Reabastecimiento }    from "./modules/inventario/Reabastecimiento";
import { InvValorizado }       from "./modules/inventario/InvValorizado";
import { Trazabilidad }        from "./modules/inventario/Trazabilidad";
import { PortalSolicitudes }   from "./modules/inventario/PortalSolicitudes";
import { BandejaGestion }      from "./modules/inventario/BandejaGestion";
import { ConfigInventario }    from "./modules/inventario/ConfigInventario";

// módulos — proveeduría
import { ProveeduriaHome }     from "./modules/proveeduria/ProveeduriaHome";
import { Proveedores }         from "./modules/proveeduria/Proveedores";
import { ResumenProveedores }  from "./modules/proveeduria/ResumenProveedores";
import { OrdenesCompra }       from "./modules/proveeduria/OrdenesCompra";
import { NuevaOrdenCompra }    from "./modules/proveeduria/NuevaOrdenCompra";
import { ComparadorProveedores } from "./modules/proveeduria/ComparadorProveedores";
import { Cotizaciones }        from "./modules/proveeduria/Cotizaciones";
import { NuevaCotizacion }     from "./modules/proveeduria/NuevaCotizacion";

// módulos — BI & reportería
import { BIReporteria }        from "./modules/bi/BIReporteria";
import { GeneradorReportes }   from "./modules/bi/GeneradorReportes";

// módulos — RRHH
import { RRHHHome }            from "./modules/rrhh/RRHHHome";
import { AdminPersonal }       from "./modules/rrhh/AdminPersonal";
import { NominaComp }          from "./modules/rrhh/NominaComp";
import { ControlAsistencia }   from "./modules/rrhh/ControlAsistencia";
import { GestionDesempeno }    from "./modules/rrhh/GestionDesempeno";
import { Reclutamiento }       from "./modules/rrhh/Reclutamiento";
import { Capacitacion }        from "./modules/rrhh/Capacitacion";
import { ClimaYSalud }         from "./modules/rrhh/ClimaYSalud";

// módulos — config
import { ConfigGeneral }       from "./modules/config/ConfigGeneral";
import { ConfigRRHH }          from "./modules/config/ConfigRRHH";
import { CatalogoPlanillas }   from "./modules/config/CatalogoPlanillas";

// módulos — empresas
import { ModuloEmpresas }      from "./modules/empresas/ModuloEmpresas";

// módulos — finanzas
import { FinanzasHome }        from "./modules/finanzas/FinanzasHome";
import { LibroDiario }         from "./modules/finanzas/LibroDiario";
import { CuentasPorCobrar }    from "./modules/finanzas/CuentasPorCobrar";
import { CuentasPorPagar }     from "./modules/finanzas/CuentasPorPagar";
import { EstadosFinancieros }  from "./modules/finanzas/EstadosFinancieros";
import { FlujoCaja }           from "./modules/finanzas/FlujoCaja";
import { Facturacion }         from "./modules/finanzas/Facturacion";
import { ConexionBancaria }    from "./modules/finanzas/ConexionBancaria";
import { ConfigFinanzas }      from "./modules/finanzas/ConfigFinanzas";

export default function App() {
  const [appState, setAppState] = useState<"login" | "selector" | "app">("login");
  const [company, setCompany]   = useState<Company>(COMPANIES[0]);
  const [view, setView]         = useState<View>("existencias");
  const [step, setStep]         = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const [catalogos, setCatalogos] = useState(CATALOGOS_INIT);
  const [empleados, setEmpleados] = useState(COLABORADORES_INIT);
  const [asientosContables, setAsientosContables] = useState<AsientoContable[]>(ASIENTOS_INIT);
  const [articulos, setArticulos] = useState<Articulo[]>(ARTICULOS_INIT);
  const [movimientosInv, setMovimientosInv] = useState<MovimientoInventario[]>(MOVIMIENTOS_INIT);
  const [bodegas, setBodegas] = useState<Bodega[]>(BODEGAS_INIT);
  const [categoriasInv, setCategoriasInv] = useState<CategoriaInventario[]>(CATEGORIAS_INIT);
  const [proveedoresInv, setProveedoresInv] = useState<ProveedorInventario[]>(PROVEEDORES_INIT);
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>(ORDENES_COMPRA_INIT);
  const [facturasCxp, setFacturasCxp] = useState<Factura[]>(FACTURAS_CXP_INIT);
  const [proveedorArticulos] = useState<ProveedorArticulo[]>(PROVEEDOR_ARTICULO_INIT);
  const [documentosProveedor, setDocumentosProveedor] = useState<DocumentoProveedor[]>(DOCUMENTOS_PROVEEDOR_INIT);
  const [recepciones, setRecepciones] = useState<Recepcion[]>(RECEPCIONES_INIT);
  const [evaluacionesServicio, setEvaluacionesServicio] = useState<EvaluacionServicio[]>([]);
  const [devoluciones, setDevoluciones] = useState<DevolucionProveedor[]>([]);
  const [solicitudesCotizacion, setSolicitudesCotizacion] = useState<SolicitudCotizacion[]>([]);
  const [ofertasProveedor, setOfertasProveedor] = useState<OfertaProveedor[]>([]);
  const [auditoriaProveedores, setAuditoriaProveedores] = useState<AuditoriaProveedor[]>([]);
  const [auditoriaOC, setAuditoriaOC] = useState<AuditoriaOC[]>([]);

  if (appState === "login")    return <LoginScreen    onLogin={() => setAppState("selector")} />;
  if (appState === "selector") return <CompanySelector onSelect={c => { setCompany(c); setAppState("app"); }} />;

  return (
    <div className="app">
      <Sidebar
        view={view} setView={setView} setStep={setStep}
        company={company} onSwitch={() => setAppState("selector")}
        collapsed={collapsed} setCollapsed={setCollapsed}
      />
      <div className="main">
        <Header view={view} setView={setView} company={company} onSwitch={() => setAppState("selector")} />

        {/* INVENTARIO */}
        {view === "inventario"   && <InventarioHome    setView={setView} articulos={articulos} movimientos={movimientosInv} />}
        {view === "existencias"  && <ConsultaExistencias setView={setView} articulos={articulos} movimientos={movimientosInv} bodegas={bodegas} categorias={categoriasInv} proveedores={proveedoresInv} />}
        {view === "nuevo"        && <NuevoArticulo step={step} setStep={setStep} setView={setView} articulos={articulos} setArticulos={setArticulos} bodegas={bodegas} categorias={categoriasInv} proveedores={proveedoresInv} />}
        {view === "entradas"     && <EntradasSalidas   setView={setView} movimientos={movimientosInv} articulos={articulos} bodegas={bodegas} />}
        {view === "ingreso"      && <RegistrarIngreso  setView={setView} articulos={articulos} setArticulos={setArticulos} movimientos={movimientosInv} setMovimientos={setMovimientosInv} bodegas={bodegas} proveedores={proveedoresInv} />}
        {view === "salida"       && <RegistrarSalida   setView={setView} articulos={articulos} setArticulos={setArticulos} movimientos={movimientosInv} setMovimientos={setMovimientosInv} bodegas={bodegas} catalogos={catalogos} />}
        {view === "traslado"     && <TrasladoBodegas   setView={setView} articulos={articulos} setArticulos={setArticulos} movimientos={movimientosInv} setMovimientos={setMovimientosInv} bodegas={bodegas} catalogos={catalogos} />}
        {view === "ajuste"       && <AjusteInventario  setView={setView} articulos={articulos} setArticulos={setArticulos} movimientos={movimientosInv} setMovimientos={setMovimientosInv} />}
        {view === "baja"         && <BajaDescarte      setView={setView} articulos={articulos} setArticulos={setArticulos} movimientos={movimientosInv} setMovimientos={setMovimientosInv} />}
        {view === "conteo"       && <ConteoAuditoria   setView={setView} articulos={articulos} setArticulos={setArticulos} movimientos={movimientosInv} setMovimientos={setMovimientosInv} bodegas={bodegas} />}
        {view === "reabasto"     && <Reabastecimiento  setView={setView} articulos={articulos} proveedores={proveedoresInv} ordenesCompra={ordenesCompra} setOrdenesCompra={setOrdenesCompra} documentosProveedor={documentosProveedor} setAuditoriaOC={setAuditoriaOC} />}
        {view === "valorizado"   && <InvValorizado articulos={articulos} categorias={categoriasInv} />}
        {view === "trazabilidad" && <Trazabilidad articulos={articulos} movimientos={movimientosInv} bodegas={bodegas} proveedores={proveedoresInv} />}

        {/* PROVEEDURÍA */}
        {view === "proveeduria"   && <ProveeduriaHome   setView={setView} ordenesCompra={ordenesCompra} proveedores={proveedoresInv} facturasCxp={facturasCxp} recepciones={recepciones} evaluacionesServicio={evaluacionesServicio} documentosProveedor={documentosProveedor} articulos={articulos} proveedorArticulos={proveedorArticulos} />}
        {view === "proveedores"   && <Proveedores       setView={setView} proveedores={proveedoresInv} setProveedores={setProveedoresInv} articulos={articulos} ordenesCompra={ordenesCompra} categorias={categoriasInv} facturasCxp={facturasCxp} proveedorArticulos={proveedorArticulos} documentosProveedor={documentosProveedor} setDocumentosProveedor={setDocumentosProveedor} recepciones={recepciones} evaluacionesServicio={evaluacionesServicio} devoluciones={devoluciones} setDevoluciones={setDevoluciones} auditoriaProveedores={auditoriaProveedores} setAuditoriaProveedores={setAuditoriaProveedores} />}
        {view === "resumen-proveedores" && <ResumenProveedores setView={setView} proveedores={proveedoresInv} ordenesCompra={ordenesCompra} recepciones={recepciones} evaluacionesServicio={evaluacionesServicio} documentosProveedor={documentosProveedor} articulos={articulos} categorias={categoriasInv} proveedorArticulos={proveedorArticulos} facturasCxp={facturasCxp} devoluciones={devoluciones} />}
        {view === "ordenes-compra" && <OrdenesCompra    setView={setView} ordenesCompra={ordenesCompra} setOrdenesCompra={setOrdenesCompra} proveedores={proveedoresInv} bodegas={bodegas} articulos={articulos} setArticulos={setArticulos} movimientos={movimientosInv} setMovimientos={setMovimientosInv} facturasCxp={facturasCxp} setFacturasCxp={setFacturasCxp} recepciones={recepciones} setRecepciones={setRecepciones} evaluacionesServicio={evaluacionesServicio} setEvaluacionesServicio={setEvaluacionesServicio} devoluciones={devoluciones} setDevoluciones={setDevoluciones} auditoriaOC={auditoriaOC} setAuditoriaOC={setAuditoriaOC} />}
        {view === "nueva-oc"      && <NuevaOrdenCompra  setView={setView} proveedores={proveedoresInv} bodegas={bodegas} articulos={articulos} ordenesCompra={ordenesCompra} setOrdenesCompra={setOrdenesCompra} documentosProveedor={documentosProveedor} setAuditoriaOC={setAuditoriaOC} />}
        {view === "comparador"    && <ComparadorProveedores setView={setView} proveedores={proveedoresInv} ordenesCompra={ordenesCompra} proveedorArticulos={proveedorArticulos} articulos={articulos} recepciones={recepciones} evaluacionesServicio={evaluacionesServicio} />}
        {view === "cotizaciones"  && <Cotizaciones      setView={setView} proveedores={proveedoresInv} bodegas={bodegas} articulos={articulos} solicitudes={solicitudesCotizacion} setSolicitudes={setSolicitudesCotizacion} ofertas={ofertasProveedor} setOfertas={setOfertasProveedor} ordenesCompra={ordenesCompra} setOrdenesCompra={setOrdenesCompra} recepciones={recepciones} evaluacionesServicio={evaluacionesServicio} documentosProveedor={documentosProveedor} setAuditoriaOC={setAuditoriaOC} />}
        {view === "nueva-cotizacion" && <NuevaCotizacion setView={setView} proveedores={proveedoresInv} bodegas={bodegas} articulos={articulos} solicitudes={solicitudesCotizacion} setSolicitudes={setSolicitudesCotizacion} documentosProveedor={documentosProveedor} />}
        {view === "bi"           && <BIReporteria setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "reportes"     && <GeneradorReportes />}
        {view === "bi-ejecutivo" && <BIReporteria setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "bi-rrhh"      && <BIReporteria setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "bi-inv"       && <BIReporteria setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "bi-calidad"   && <BIReporteria setView={setView} empleados={empleados} catalogos={catalogos} />}

        {/* SOLICITUDES & CONFIG */}
        {view === "solicitudes"  && <PortalSolicitudes setView={setView} />}
        {view === "bandeja"      && <BandejaGestion    setView={setView} />}
        {view === "config-inv"   && <ConfigInventario  setView={setView} bodegas={bodegas} setBodegas={setBodegas} categorias={categoriasInv} setCategorias={setCategoriasInv} articulos={articulos} />}

        {/* CONFIGURACIÓN GENERAL & RRHH */}
        {view === "config-gral"  && <ConfigGeneral    setView={setView} catalogos={catalogos} setCatalogos={setCatalogos} />}
        {view === "config-rrhh"  && <ConfigRRHH       setView={setView} />}
        {view === "planillas"    && <CatalogoPlanillas setView={setView} catalogos={catalogos} setCatalogos={setCatalogos} empleados={empleados} setEmpleados={setEmpleados} />}

        {/* EMPRESAS & VERTICALES */}
        {view === "empresas"        && <ModuloEmpresas setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "empresa-detalle" && <ModuloEmpresas setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "verticales"      && <ModuloEmpresas setView={setView} empleados={empleados} catalogos={catalogos} />}

        {/* RRHH */}
        {view === "rrhh"           && <RRHHHome          setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "admin-personal" && <AdminPersonal     setView={setView} empleados={empleados} setEmpleados={setEmpleados} catalogos={catalogos} />}
        {view === "nomina"         && <NominaComp        setView={setView} empleados={empleados} catalogos={catalogos} asientosContables={asientosContables} setAsientosContables={setAsientosContables} />}
        {view === "asistencia"     && <ControlAsistencia setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "desempeno"      && <GestionDesempeno  setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "reclutamiento"  && <Reclutamiento     setView={setView} empleados={empleados} setEmpleados={setEmpleados} catalogos={catalogos} />}
        {view === "capacitacion"   && <Capacitacion      setView={setView} />}
        {view === "clima"          && <ClimaYSalud       setView={setView} />}

        {/* FINANZAS */}
        {view === "finanzas"             && <FinanzasHome        setView={setView} asientos={asientosContables} />}
        {view === "libro-diario"         && <LibroDiario          setView={setView} asientos={asientosContables} setAsientos={setAsientosContables} />}
        {view === "cxc"                  && <CuentasPorCobrar     setView={setView} />}
        {view === "cxp"                  && <CuentasPorPagar      setView={setView} facturas={facturasCxp} setFacturas={setFacturasCxp} />}
        {view === "estados-financieros"  && <EstadosFinancieros   setView={setView} asientos={asientosContables} />}
        {view === "flujo-caja"           && <FlujoCaja            setView={setView} />}
        {view === "facturacion"          && <Facturacion          setView={setView} />}
        {view === "banca"                && <ConexionBancaria     setView={setView} />}
        {view === "config-finanzas"      && <ConfigFinanzas       setView={setView} />}
      </div>
    </div>
  );
}
