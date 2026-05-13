import TabBar from './TabBar';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';

export default function AppShell() {
  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      <TabBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <ContentArea />
      </div>
    </div>
  );
}
