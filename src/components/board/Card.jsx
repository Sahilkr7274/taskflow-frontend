import { Draggable } from '@hello-pangea/dnd';
import { format, startOfDay, addDays } from 'date-fns';
import { Clock, CheckSquare } from 'lucide-react';

export default function Card({ card, index, onClick }) {
  const completedItems = card.checklist?.filter(i => i.completed).length || 0;
  const totalItems = card.checklist?.length || 0;

  // Use date-only comparison (strip time) — matches backend CURRENT_DATE logic
  const today = startOfDay(new Date());
  const dueDay = card.due_date ? startOfDay(new Date(card.due_date)) : null;
  const isOverdue = dueDay && dueDay < today;                          // strictly before today
  const isDueSoon = dueDay && dueDay >= today && dueDay <= addDays(today, 3); // today up to +3 days

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(card)}
          className={`card-item rounded-lg p-3 mb-2 cursor-pointer transition-all group
            ${snapshot.isDragging ? 'rotate-2 shadow-lg ring-2 ring-blue-400 opacity-90' : ''}`}
        >
          {/* Labels */}
          {card.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map(label => (
                <span
                  key={label.id}
                  className="h-2 w-10 rounded-full"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ))}
            </div>
          )}

          <p className="text-sm text-gray-800 leading-snug">{card.title}</p>

          {/* Footer badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {card.due_date && (
              <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium
                ${isOverdue ? 'bg-red-100 text-red-700' : isDueSoon ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                <Clock size={10} />
                {format(new Date(card.due_date), 'MMM d')}
              </span>
            )}
            {totalItems > 0 && (
              <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded
                ${completedItems === totalItems ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                <CheckSquare size={10} />
                {completedItems}/{totalItems}
              </span>
            )}
            {card.members?.length > 0 && (
              <div className="flex -space-x-1 ml-auto">
                {card.members.slice(0, 3).map(m => (
                  <div
                    key={m.id}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                    style={{ backgroundColor: m.avatar_color }}
                    title={m.name}
                  >
                    {m.name[0]}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
