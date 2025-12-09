export class BookingCreatedEvent {
  id: number;
  startTime: string; // Datas chegam como string via JSON
  endTime: string;
  user: {
    id: number;
    email: string;
  };
  room: {
    name: string;
  };
}