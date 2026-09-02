import React, { useState } from "react";
import type { View, Articulo, ProveedorInventario, Bodega, CategoriaInventario } from "../../types";

interface ErrorValidacion {
  fila: number;
  campo: string;
  error: string;
}

interface ArticuloPreview extends Articulo {
  _valido: boolean;
  _errores: string[];
}

export function ImportadorArticulos({
  setView,
  articulos,
  setArticulos,
  proveedores,
  bodegas,
  categorias,
}: {
  setView: (v: View) => void;
  articulos: Articulo[];
  setArticulos: React.Dispatch<React.SetStateAction<Articulo[]>>;
  proveedores: ProveedorInventario[];
  bodegas: Bodega[];
  categorias: CategoriaInventario[];
}) {
  const [step, setStep] = useState<"upload" | "preview" | "complete">("upload");
  const [articulosPreview, setArticulosPreview] = useState<ArticuloPreview[]>([]);
  const [erroresValidacion, setErroresValidacion] = useState<ErrorValidacion[]>([]);
  const [resumenCarga, setResumenCarga] = useState<{ exitosos: number; fallidos: number }>({ exitosos: 0, fallidos: 0 });
  const [mostrarGuia, setMostrarGuia] = useState(false);

  const parseCSV = async (file: File): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lineas = csv.split("\n").filter((l) => l.trim());
          const headers = lineas[0].split(",").map((h) => h.trim());
          const datos = lineas.slice(1).map((linea) => {
            const valores = linea.split(",").map((v) => v.trim());
            const registro: Record<string, string> = {};
            headers.forEach((header, i) => {
              registro[header] = valores[i] || "";
            });
            return registro;
          });
          resolve(datos);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Error al leer archivo"));
      reader.readAsText(file);
    });
  };

  const validarArticulo = (dato: Record<string, string>, fila: number): { valido: boolean; errores: string[] } => {
    const errores: string[] = [];

    // Validar ID
    if (!dato.id || dato.id.length === 0) errores.push("ID es requerido");
    else if (articulos.some((a) => a.id === dato.id) || articulosPreview.some((a) => a.id === dato.id && a !== articulosPreview[fila - 2]))
      errores.push("ID duplicado en el sistema o en este lote");

    // Validar nombre
    if (!dato.nombre || dato.nombre.length === 0) errores.push("Nombre es requerido");

    // Validar categoría
    if (!dato.categoriaId || !categorias.some((c) => c.id === dato.categoriaId))
      errores.push(`Categoría inválida (use: ${categorias.map((c) => c.id).join(", ")})`);

    // Validar bodega
    if (!dato.bodegaId || !bodegas.some((b) => b.id === dato.bodegaId))
      errores.push(`Bodega inválida (use: ${bodegas.map((b) => b.id).join(", ")})`);

    // Validar proveedor
    if (!dato.proveedorId || !proveedores.some((p) => p.id === dato.proveedorId))
      errores.push(`Proveedor inválido (use: ${proveedores.map((p) => p.id).join(", ")})`);

    // Validar método de valuación
    if (!["FIFO", "Promedio", "LIFO"].includes(dato.metodoValuacion))
      errores.push("Método valuación debe ser: FIFO, Promedio o LIFO");

    // Validar números
    const stock = parseInt(dato.stock || "0");
    const min = parseInt(dato.min || "0");
    const max = parseInt(dato.max || "0");
    const costo = parseInt(dato.costoUnitario || "0");

    if (isNaN(stock) || stock < 0) errores.push("Stock debe ser número ≥ 0");
    if (isNaN(min) || min <= 0) errores.push("Min debe ser número > 0");
    if (isNaN(max) || max <= 0) errores.push("Max debe ser número > 0");
    if (isNaN(costo) || costo <= 0) errores.push("Costo debe ser número > 0");
    if (min >= max) errores.push("Min debe ser menor que Max");
    if (stock > max) errores.push("Stock no puede ser mayor que Max");

    // Validar booleano
    if (!["true", "false"].includes(dato.activo.toLowerCase())) errores.push("Activo debe ser: true o false");

    return { valido: errores.length === 0, errores };
  };

  const handleCargarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.type.includes("spreadsheetml")) {
      alert("Solo se permiten archivos CSV o Excel");
      return;
    }

    setErroresValidacion([]);

    try {
      const datos = await parseCSV(file);
      const preview: ArticuloPreview[] = [];
      const errores: ErrorValidacion[] = [];

      datos.forEach((dato, index) => {
        const { valido, errores: errsValidacion } = validarArticulo(dato, index + 2);
        const articulo: ArticuloPreview = {
          id: dato.id,
          nombre: dato.nombre,
          descripcion: dato.descripcion || "",
          categoriaId: dato.categoriaId,
          bodegaId: dato.bodegaId,
          unidad: dato.unidad || "Pzas.",
          stock: parseInt(dato.stock) || 0,
          min: parseInt(dato.min) || 0,
          max: parseInt(dato.max) || 0,
          costoUnitario: parseInt(dato.costoUnitario) || 0,
          proveedorId: dato.proveedorId,
          metodoValuacion: (dato.metodoValuacion as any) || "Promedio",
          activo: dato.activo.toLowerCase() === "true",
          fechaCreacion: dato.fechaCreacion || new Date().toLocaleDateString(),
          _valido: valido,
          _errores: errsValidacion,
        };

        preview.push(articulo);

        errsValidacion.forEach((error) => {
          errores.push({ fila: index + 2, campo: error.split(":")[0], error });
        });
      });

      setArticulosPreview(preview);
      setErroresValidacion(errores);
      setStep("preview");
    } catch (error) {
      alert(`Error al procesar archivo: ${error}`);
    } finally {
      // archivo procesado
    }
  };

  const handleImportar = () => {
    const articulosValidos = articulosPreview.filter((a) => a._valido);
    if (articulosValidos.length === 0) {
      alert("No hay artículos válidos para importar");
      return;
    }

    setArticulos((prev) => [...prev, ...articulosValidos]);
    setResumenCarga({
      exitosos: articulosValidos.length,
      fallidos: articulosPreview.length - articulosValidos.length,
    });
    setStep("complete");
  };

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <div className="page-title">Importar Artículos — Inventario</div>
          <div className="page-subtitle">Carga masiva desde archivo CSV o Excel</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>setMostrarGuia(!mostrarGuia)} style={{display:"flex",alignItems:"center",gap:6}}>
            ❓ Guía
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setView("config-inv")}>
            ← Volver
          </button>
        </div>
      </div>

      {mostrarGuia && (
        <div style={{background:"#f9f9f9",border:"1px solid #ddd",borderRadius:8,padding:20,marginBottom:20}}>
          <div style={{fontSize:18,fontWeight:600,marginBottom:15,color:"#e8611a"}}>📋 Guía Rápida de Carga</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,fontSize:12}}>
            <div>
              <div style={{fontWeight:600,marginBottom:8,color:"#333"}}>Los 3 Errores Más Comunes:</div>
              <div style={{marginBottom:12,padding:10,background:"#fee2e2",borderRadius:4,borderLeft:"3px solid #ef4444"}}>
                <strong>❌ Stock > Max</strong><br/>Si Max=10, Stock debe ser ≤10
              </div>
              <div style={{marginBottom:12,padding:10,background:"#fee2e2",borderRadius:4,borderLeft:"3px solid #ef4444"}}>
                <strong>❌ Min ≥ Max</strong><br/>Min debe ser < Max
              </div>
              <div style={{padding:10,background:"#fee2e2",borderRadius:4,borderLeft:"3px solid #ef4444"}}>
                <strong>❌ Códigos inválidos</strong><br/>Usar: C1-C6, B1-B3, PV1-PV8
              </div>
            </div>
            <div>
              <div style={{fontWeight:600,marginBottom:8,color:"#333"}}>Códigos Válidos:</div>
              <table style={{width:"100%",fontSize:11,borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#e8611a",color:"white"}}>
                    <th style={{padding:6,textAlign:"left"}}>Categoría</th>
                    <th style={{padding:6,textAlign:"left"}}>Bodega</th>
                    <th style={{padding:6,textAlign:"left"}}>Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{padding:6,borderBottom:"1px solid #ddd"}}>C1: Herramienta</td><td style={{padding:6,borderBottom:"1px solid #ddd"}}>B1: Central</td><td style={{padding:6,borderBottom:"1px solid #ddd"}}>PV1-PV8</td></tr>
                  <tr><td style={{padding:6,borderBottom:"1px solid #ddd"}}>C2: Consumible</td><td style={{padding:6,borderBottom:"1px solid #ddd"}}>B2: Heredia</td><td style={{padding:6,borderBottom:"1px solid #ddd"}}>FIFO</td></tr>
                  <tr><td style={{padding:6,borderBottom:"1px solid #ddd"}}>C3: Insumo</td><td style={{padding:6,borderBottom:"1px solid #ddd"}}>B3: Taller</td><td style={{padding:6,borderBottom:"1px solid #ddd"}}>Promedio</td></tr>
                  <tr><td style={{padding:6,borderBottom:"1px solid #ddd"}}>C4: Electrónica</td><td style={{padding:6}}></td><td style={{padding:6,borderBottom:"1px solid #ddd"}}>LIFO</td></tr>
                  <tr><td style={{padding:6}}>C5: Seguridad</td></tr>
                  <tr><td style={{padding:6}}>C6: Activo Fijo</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div style={{marginTop:15,padding:12,background:"#d1fae5",borderLeft:"3px solid #10b981",borderRadius:4,fontSize:12}}>
            <strong>💡 Consejo:</strong> Copy-paste los códigos desde las hojas de referencia del Excel. Así evitas errores de tipografía.
          </div>
          <button className="btn btn-secondary btn-sm" onClick={()=>setMostrarGuia(false)} style={{marginTop:12}}>← Cerrar Guía</button>
        </div>
      )}

      {step === "upload" && (
        <div className="card" style={{ maxWidth: 600, margin: "40px auto" }}>
          <div className="card-title">📤 Seleccionar Archivo</div>
          <div
            style={{
              border: "2px dashed #E8611A",
              borderRadius: 12,
              padding: 40,
              textAlign: "center",
              background: "#FFF3ED",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.background = "#FFE5D0";
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.background = "#FFF3ED";
            }}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              const input = document.querySelector("input[type=file]") as HTMLInputElement;
              if (input && file) {
                const dt = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;
                handleCargarArchivo({ target: { files: dt.files } } as any);
              }
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Arrastra tu archivo aquí</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>o haz clic para seleccionar</div>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleCargarArchivo} style={{ display: "none" }} />
            <button className="btn btn-primary btn-sm" onClick={() => (document.querySelector("input[type=file]") as HTMLInputElement)?.click()}>
              Seleccionar Archivo
            </button>
          </div>
          <div style={{ marginTop: 20, padding: 12, background: "#F0F9FF", borderRadius: 8, fontSize: 12 }}>
            <div style={{ fontWeight: 600, color: "#0369A1", marginBottom: 8 }}>📋 Formato Requerido:</div>
            <div style={{ color: "#0C4A6E" }}>
              <div>✓ Columnas: id, nombre, descripcion, categoriaId, bodegaId, unidad, stock, min, max, costoUnitario, proveedorId, metodoValuacion, activo, fechaCreacion</div>
              <div>✓ Formato: CSV o Excel (.csv, .xlsx)</div>
              <div>✓ Descarga la plantilla: CARGA_MASIVA_INVENTARIO_PROCENTER.xlsx</div>
            </div>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
              <div className="card" style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>📦</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Total a importar</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#E8611A" }}>{articulosPreview.length}</div>
              </div>
              <div className="card" style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>✅</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Válidos</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#10B981" }}>{articulosPreview.filter((a) => a._valido).length}</div>
              </div>
              <div className="card" style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>⚠️</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Con errores</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#EF4444" }}>{articulosPreview.filter((a) => !a._valido).length}</div>
              </div>
            </div>
          </div>

          {erroresValidacion.length > 0 && (
            <div className="card" style={{ marginBottom: 16, background: "#FEE2E2", borderLeft: "4px solid #DC2626" }}>
              <div style={{ fontWeight: 600, color: "#DC2626", marginBottom: 10 }}>⚠️ Errores de Validación ({erroresValidacion.length})</div>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {erroresValidacion.map((err, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#991B1B", padding: "6px 0", borderBottom: i < erroresValidacion.length - 1 ? "1px solid #FCA5A5" : "none" }}>
                    <span style={{ fontWeight: 600 }}>Fila {err.fila}:</span> {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ overflowX: "auto", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#E8611A", color: "white" }}>
                  <th style={{ padding: 10, textAlign: "left" }}>Estado</th>
                  <th style={{ padding: 10, textAlign: "left" }}>ID</th>
                  <th style={{ padding: 10, textAlign: "left" }}>Nombre</th>
                  <th style={{ padding: 10, textAlign: "center" }}>Stock</th>
                  <th style={{ padding: 10, textAlign: "center" }}>Min-Max</th>
                  <th style={{ padding: 10, textAlign: "right" }}>Costo</th>
                  <th style={{ padding: 10, textAlign: "left" }}>Bodega</th>
                </tr>
              </thead>
              <tbody>
                {articulosPreview.map((art, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#F9FAFB" : "white", borderBottom: "1px solid #E5E7EB" }}>
                    <td style={{ padding: 10 }}>
                      {art._valido ? (
                        <span style={{ fontSize: 16 }}>✅</span>
                      ) : (
                        <span style={{ fontSize: 16 }} title={art._errores.join(", ")}>
                          ❌
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 10, fontWeight: 600 }}>{art.id}</td>
                    <td style={{ padding: 10 }}>{art.nombre}</td>
                    <td style={{ padding: 10, textAlign: "center" }}>
                      <span style={{ background: art.stock <= art.min ? "#FEE2E2" : "#D1FAE5", padding: "4px 8px", borderRadius: 4, fontSize: 11 }}>
                        {art.stock}
                      </span>
                    </td>
                    <td style={{ padding: 10, textAlign: "center", fontSize: 11 }}>
                      {art.min}-{art.max}
                    </td>
                    <td style={{ padding: 10, textAlign: "right" }}>₡{art.costoUnitario.toLocaleString()}</td>
                    <td style={{ padding: 10 }}>{art.bodegaId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
            <button className="btn btn-secondary" onClick={() => setStep("upload")}>
              ← Cambiar archivo
            </button>
            <button className="btn btn-primary" disabled={articulosPreview.filter((a) => a._valido).length === 0} onClick={handleImportar}>
              ✅ Importar {articulosPreview.filter((a) => a._valido).length} Artículos
            </button>
          </div>
        </div>
      )}

      {step === "complete" && (
        <div className="card" style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div className="card-title">¡Importación Completada!</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "20px 0" }}>
            <div style={{ padding: 16, background: "#D1FAE5", borderRadius: 8 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#10B981" }}>{resumenCarga.exitosos}</div>
              <div style={{ fontSize: 12, color: "#065F46" }}>Artículos importados correctamente</div>
            </div>
            {resumenCarga.fallidos > 0 && (
              <div style={{ padding: 16, background: "#FEE2E2", borderRadius: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#EF4444" }}>{resumenCarga.fallidos}</div>
                <div style={{ fontSize: 12, color: "#7F1D1D" }}>Artículos rechazados</div>
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => setView("inventario")}>
            ← Ir al Inventario
          </button>
        </div>
      )}
    </div>
  );
}
