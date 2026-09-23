import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export const CustomDatePicker = ({ date, onChange, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(date ? new Date(date + 'T00:00:00') : new Date());
  const selectedDate = date ? new Date(date + 'T00:00:00') : null;

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  const handleDateClick = (day) => {
    onChange(format(day, 'yyyy-MM-dd'));
  };

  return (
    <div style={{ width: '280px', background: 'white', borderRadius: '16px', overflow: 'hidden', userSelect: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ padding: '16px', background: '#2563eb', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
        <ChevronLeft onClick={(e) => { e.stopPropagation(); prevMonth(); }} style={{ cursor: 'pointer' }} />
        <span style={{ fontSize: '16px', textTransform: 'capitalize' }}>
           {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <ChevronRight onClick={(e) => { e.stopPropagation(); nextMonth(); }} style={{ cursor: 'pointer' }} />
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px', textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>
          {weekDays.map(d => <div key={d}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map((day, i) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            return (
              <div 
                key={i} 
                onClick={(e) => { e.stopPropagation(); handleDateClick(day); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: '32px', width: '32px', margin: '0 auto',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '14px',
                  background: isSelected ? '#2563eb' : 'transparent',
                  color: isSelected ? 'white' : (isCurrentMonth ? '#334155' : '#cbd5e1'),
                  fontWeight: isSelected ? 'bold' : 'normal',
                }}
                onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                {format(day, 'd')}
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ padding: '0 16px 16px', textAlign: 'right' }}>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ padding: '8px 16px', background: 'transparent', color: '#2563eb', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>LISTO</button>
      </div>
    </div>
  );
};

export const CustomTimeClock = ({ time, onChange, onClose }) => {
  const [mode, setMode] = useState('hours');
  
  const [hStr, mStr] = (time || '00:00').split(':');
  let hour = parseInt(hStr, 10);
  let minute = parseInt(mStr, 10);
  if (isNaN(hour)) hour = 0;
  if (isNaN(minute)) minute = 0;

  const center = 120;
  const rOuter = 90;
  const rInner = 55;

  const handleSvgClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    const dist = Math.sqrt(x*x + y*y);
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (mode === 'hours') {
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      
      if (dist < 70) {
        h = h === 12 ? 0 : h + 12;
      } else {
        if (h === 12) h = 0; 
      }
      onChange(`${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      setMode('minutes');
    } else {
      let m = Math.round(angle / 6);
      if (m === 60) m = 0;
      onChange(`${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  };

  const currentAngle = mode === 'hours' ? (hour % 12) * 30 : minute * 6;
  const isInner = mode === 'hours' && (hour === 0 || hour > 12);
  const pointerLength = mode === 'minutes' ? rOuter : (isInner ? rInner : rOuter);

  const renderNumbers = () => {
    if (mode === 'hours') {
      const hoursOuter = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const hoursInner = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
      
      return (
        <g>
          {hoursOuter.map(h => {
            const display = h === 0 ? 12 : h;
            const a = (h * 30 - 90) * (Math.PI / 180);
            return (
              <text key={h} x={center + rOuter * Math.cos(a)} y={center + rOuter * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fontSize="14" fill={hour === h ? 'white' : '#334155'} style={{ pointerEvents: 'none' }}>
                {display}
              </text>
            )
          })}
          {hoursInner.map(h => {
            const display = h === 12 ? '00' : h;
            const a = (h * 30 - 90) * (Math.PI / 180);
            return (
              <text key={h} x={center + rInner * Math.cos(a)} y={center + rInner * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fontSize="12" fill={hour === h ? 'white' : '#64748b'} style={{ pointerEvents: 'none' }}>
                {display}
              </text>
            )
          })}
        </g>
      );
    } else {
      const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
      return (
        <g>
          {minutes.map(m => {
            const a = (m * 6 - 90) * (Math.PI / 180);
            return (
              <text key={m} x={center + rOuter * Math.cos(a)} y={center + rOuter * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fontSize="14" fill={minute === m ? 'white' : '#334155'} style={{ pointerEvents: 'none' }}>
                {m.toString().padStart(2, '0')}
              </text>
            )
          })}
        </g>
      );
    }
  };

  return (
    <div style={{ width: '280px', background: 'white', borderRadius: '16px', overflow: 'hidden', userSelect: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ padding: '16px', background: '#2563eb', color: 'white', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '32px', fontWeight: 'bold' }}>
        <span onClick={() => setMode('hours')} style={{ opacity: mode === 'hours' ? 1 : 0.6, cursor: 'pointer' }}>{hour.toString().padStart(2, '0')}</span>
        <span>:</span>
        <span onClick={() => setMode('minutes')} style={{ opacity: mode === 'minutes' ? 1 : 0.6, cursor: 'pointer' }}>{minute.toString().padStart(2, '0')}</span>
      </div>
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
        <svg width="240" height="240" onClick={handleSvgClick} style={{ cursor: 'pointer', borderRadius: '50%', background: '#f1f5f9' }}>
          <circle cx={center} cy={center} r={115} fill="#f1f5f9" />
          <g transform={`rotate(${currentAngle}, ${center}, ${center})`}>
            <line x1={center} y1={center} x2={center} y2={center - pointerLength} stroke="#2563eb" strokeWidth="2" />
            <circle cx={center} cy={center - pointerLength} r="14" fill="#2563eb" />
            <circle cx={center} cy={center} r="4" fill="#2563eb" />
          </g>
          {renderNumbers()}
        </svg>
      </div>
      <div style={{ padding: '8px 16px 16px', textAlign: 'right' }}>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ padding: '8px 16px', background: 'transparent', color: '#2563eb', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>LISTO</button>
      </div>
    </div>
  );
};

export default function DateTimeWidget({ value, onChange, disabled, id }) {
  let initialDate = '';
  let initialTime = '';
  
  if (value) {
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        initialDate = format(d, 'yyyy-MM-dd');
        initialTime = format(d, 'HH:mm');
      }
    } catch(e) {}
  }
  
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const wrapperRef = useRef(null);
  
  useEffect(() => {
    if (value) {
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          setDate(format(d, 'yyyy-MM-dd'));
          setTime(format(d, 'HH:mm'));
        }
      } catch(e) {}
    } else {
      setDate('');
      setTime('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowTimePicker(false);
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = (newDate, newTime) => {
    setDate(newDate);
    setTime(newTime);
    
    if (newDate && newTime) {
      const [year, month, day] = newDate.split('-');
      const [hour, minute] = newTime.split(':');
      const finalDate = new Date(year, month - 1, day, hour, minute);
      onChange(finalDate.toISOString());
    } else if (newDate) {
      const [year, month, day] = newDate.split('-');
      const finalDate = new Date(year, month - 1, day, 0, 0);
      onChange(finalDate.toISOString());
    } else {
      onChange('');
    }
  };

  return (
    <div ref={wrapperRef} style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }} id={id}>
      <div 
        className="input"
        style={{ 
          flex: 1, 
          cursor: disabled ? 'not-allowed' : 'pointer', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          opacity: disabled ? 0.6 : 1,
          backgroundColor: disabled ? '#e2e8f0' : undefined
        }}
        onClick={() => { 
          if (!disabled) {
            setShowDatePicker(!showDatePicker);
            setShowTimePicker(false);
          }
        }}
      >
        <span>{date ? format(new Date(date + 'T00:00:00'), 'dd/MM/yyyy') : 'dd/mm/aaaa'}</span>
        <Calendar size={16} color="#64748b" />
      </div>

      <div 
        className="input"
        style={{ 
          flex: 1, 
          cursor: disabled ? 'not-allowed' : 'pointer', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          opacity: disabled ? 0.6 : 1,
          backgroundColor: disabled ? '#e2e8f0' : undefined
        }}
        onClick={() => { 
          if (!disabled) {
            setShowTimePicker(!showTimePicker);
            setShowDatePicker(false);
          }
        }}
      >
        <span>{time || '--:--'}</span>
        <Clock size={16} color="#64748b" />
      </div>

      {showDatePicker && !disabled && (
        <div style={{ position: 'absolute', top: '100%', left: '0', zIndex: 50, marginTop: '8px' }}>
          <CustomDatePicker 
            date={date} 
            onChange={(newDate) => handleUpdate(newDate, time)} 
            onClose={() => setShowDatePicker(false)} 
          />
        </div>
      )}

      {showTimePicker && !disabled && (
        <div style={{ position: 'absolute', top: '100%', right: '0', zIndex: 50, marginTop: '8px' }}>
          <CustomTimeClock 
            time={time || '00:00'} 
            onChange={(newTime) => handleUpdate(date, newTime)} 
            onClose={() => setShowTimePicker(false)} 
          />
        </div>
      )}
    </div>
  );
}
