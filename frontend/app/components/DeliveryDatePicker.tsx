"use client";

import { useDeliveryAvailability } from "../hooks/useDeliveryAvailability";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useState } from "react";

interface Props {
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
}

export default function DeliveryDatePicker({ value, onChange }: Props) {
  const { data, loading, getDailyRemaining } = useDeliveryAvailability();
  const [open, setOpen] = useState(false);

  if (loading) return <p className="text-sm sm:text-base text-gray-600 animate-pulse">Cargando disponibilidad…</p>;
  if (!data) return <p className="text-sm text-red-500">No se pudo cargar disponibilidad</p>;

  const disabled = (date: Date) => {
    const ymd = format(date, "yyyy-MM-dd");
    if (!data.allowed_weekdays.includes(date.getDay())) return true;
    if (ymd < data.min_date) return true;
    if (data.blocked.includes(ymd)) return true;
    if (data.date_map[ymd] !== undefined && data.date_map[ymd] <= 0) return true;
    return false;
  };

  const selectedDate = value
    ? new Date(value + "T00:00:00")
    : new Date(data.first_valid + "T00:00:00");

  const daily = selectedDate
    ? getDailyRemaining(format(selectedDate, "yyyy-MM-dd"))
    : null;

  return (
    <div className="w-full space-y-3 sm:space-y-2">
      {/* Info cupo - Compacta en móvil */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
        <p className="text-gray-700 font-medium">
          Cupo global disponible:
        </p>
        <span className="font-bold text-lg sm:text-xl text-[#E985A7] bg-gray-50 px-2 py-1 rounded-lg sm:rounded-xl">
          {data.global_remaining}
        </span>
      </div> */}

      {/* Botón selector responsive */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="monica"
            className="w-full p-3 sm:p-4 lg:p-6 text-sm sm:text-base lg:text-lg font-medium justify-start text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-[#E985A7] focus:ring-offset-2 shadow-md transition-all h-auto min-h-[48px]"
          >
            <div className="flex flex-col items-start w-full text-left">
              <span className="text-xs sm:text-sm text-gray-500 font-medium">
                Fecha de entrega
              </span>
              <span className="font-semibold truncate">
                {value ? format(new Date(value), "dd/MM/yyyy", { locale: es }) : "Selecciona fecha"}
              </span>
              {daily !== null && (
                <span className="text-xs text-green-600 font-medium mt-1">
                  Cupo diario: {daily}
                </span>
              )}
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          side="bottom" 
          sideOffset={8}
          className="w-72 max-w-[400px] mx-auto p-0 bg-white shadow-2xl border border-gray-200 rounded-2xl overflow-hidden"
        >
          {/* Header súper compacto */}
          <div className="px-3 py-2 bg-gradient-to-r from-[#E985A7]/5 to-pink-100 border-b border-gray-100">
            <div className="text-center text-xs leading-tight">
              <p className="font-semibold text-gray-900 truncate">Fecha entrega</p>
              <p className="text-gray-600">Cupo: <span className="font-bold text-[#E985A7]">{data.global_remaining}</span></p>
            </div>
          </div>
          
          {/* Calendar full width */}
          <div className="p-3 sm:p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                if (!d) return;
                const ymd = format(d, "yyyy-MM-dd");
                onChange?.(ymd);
                setOpen(false);
              }}
              disabled={disabled}
              locale={es}
              className="w-full [&_.rdv]:h-10 [&_.rdv]:text-sm [&_.rdv-selected]:bg-[#E985A7] [&_.rdv-selected]:text-white"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
