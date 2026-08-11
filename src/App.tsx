import React, { useState } from "react";
import "./index.css";

// tipos
import type { View, Company, AsientoContable } from "./types";

// datos
import { COLABORADORES_INIT } from "./data/colaboradores";
import { CATALOGOS_INIT } from "./data/catalogos";
import { COMPANIES } from "./data/empresas";
import { ASIENTOS_INIT } from "./data/finanzas";

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
        {view === "inventario"   && <InventarioHome    setView={setView} />}
        {view === "existencias"  && <ConsultaExistencias setView={setView} />}
        {view === "nuevo"        && <NuevoArticulo step={step} setStep={setStep} setView={setView} />}
        {view === "entradas"     && <EntradasSalidas   setView={setView} />}
        {view === "ingreso"      && <RegistrarIngreso  setView={setView} />}
        {view === "salida"       && <RegistrarSalida   setView={setView} />}
        {view === "traslado"     && <TrasladoBodegas   setView={setView} />}
        {view === "ajuste"       && <AjusteInventario  setView={setView} />}
        {view === "baja"         && <BajaDescarte      setView={setView} />}
        {view === "conteo"       && <ConteoAuditoria   setView={setView} />}
        {view === "reabasto"     && <Reabastecimiento  setView={setView} />}
        {view === "valorizado"   && <InvValorizado />}
        {view === "trazabilidad" && <Trazabilidad />}
        {view === "bi"           && <BIReporteria setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "reportes"     && <GeneradorReportes />}
        {view === "bi-ejecutivo" && <BIReporteria setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "bi-rrhh"      && <BIReporteria setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "bi-inv"       && <BIReporteria setView={setView} empleados={empleados} catalogos={catalogos} />}
        {view === "bi-calidad"   && <BIReporteria setView={setView} empleados={empleados} catalogos={catalogos} />}

        {/* SOLICITUDES & CONFIG */}
        {view === "solicitudes"  && <PortalSolicitudes setView={setView} />}
        {view === "bandeja"      && <BandejaGestion    setView={setView} />}
        {view === "config-inv"   && <ConfigInventario  setView={setView} />}

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
        {view === "cxp"                  && <CuentasPorPagar      setView={setView} />}
        {view === "estados-financieros"  && <EstadosFinancieros   setView={setView} asientos={asientosContables} />}
        {view === "flujo-caja"           && <FlujoCaja            setView={setView} />}
        {view === "facturacion"          && <Facturacion          setView={setView} />}
        {view === "banca"                && <ConexionBancaria     setView={setView} />}
        {view === "config-finanzas"      && <ConfigFinanzas       setView={setView} />}
      </div>
    </div>
  );
}
