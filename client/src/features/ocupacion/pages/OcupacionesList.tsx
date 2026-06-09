import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  useOcupaciones,
  useSearchOcupaciones,
  useAdmitir,
  useDarAlta,
  useRegistrarFallecimiento,
} from "../hooks/useOcupaciones";
import AdmitirForm from "../components/AdmitirForm";
import OcupacionCard from "../components/OcupacionCard";
import type {
  AdmitirPayload,
  OcupacionPaciente,
} from "../../../shared/types/internacion";
import PageHeader from "../../../shared/components/PageHeader";
import SearchInput from "../../../shared/components/SearchInput";
import Spinner from "../../../shared/components/Spinner";
import EmptyState from "../../../shared/components/EmptyState";
import Pagination from "../../../shared/components/Pagination";

export default function OcupacionesList() {
  const [page, setPage] = useState(0);
  const [soloActivos, setSoloActivos] = useState(true);
  const [search, setSearch] = useState("");
  const limit = 20;
  const { data, isLoading } = useOcupaciones(page * limit, limit, soloActivos);
  const { data: searchData, isLoading: searchLoading } = useSearchOcupaciones(
    search,
    page * limit,
    limit,
  );
  const admitir = useAdmitir();
  const darAlta = useDarAlta();
  const registrarFallecimiento = useRegistrarFallecimiento();
  const [showAdmitir, setShowAdmitir] = useState(false);
  const isSearching = search.length >= 2;
  const list = isSearching ? searchData : data;

  const isPending = darAlta.isPending || registrarFallecimiento.isPending;

  useEffect(() => {
    setPage(0);
  }, [search, soloActivos]);

  async function handleAdmitir(data: AdmitirPayload) {
    await admitir.mutateAsync(data);
    toast.success("Paciente admitido");
  }

  async function handleAlta(id: number) {
    await darAlta.mutateAsync(id);
    toast.success("Alta registrada");
  }

  async function handleFallecimiento(id: number) {
    await registrarFallecimiento.mutateAsync(id);
    toast.success("Fallecimiento registrado");
  }

  return (
    <>
      <PageHeader
        title="Ocupación de Pacientes"
        actionLabel="Admitir"
        onAction={() => setShowAdmitir(true)}
      />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar paciente o ubicación..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPage(0);
                setSoloActivos(true);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${soloActivos ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Activos
            </button>
            <button
              onClick={() => {
                setPage(0);
                setSoloActivos(false);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${!soloActivos ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Todos
            </button>
          </div>
        </div>

        {isLoading || searchLoading ? (
          <Spinner />
        ) : !list?.data.length ? (
          <EmptyState label="pacientes internados" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {list.data.map((o: OcupacionPaciente) => (
                <OcupacionCard
                  key={o.id}
                  ocupacion={o}
                  onAlta={handleAlta}
                  onFallecido={handleFallecimiento}
                  isPending={isPending}
                />
              ))}
            </div>
            <Pagination
              page={page}
              total={list?.total ?? 0}
              limit={limit}
              onPageChange={setPage}
              label="pacientes"
            />
          </>
        )}
      </div>
      <AdmitirForm
        isOpen={showAdmitir}
        onClose={() => setShowAdmitir(false)}
        onSubmit={handleAdmitir}
      />
    </>
  );
}
