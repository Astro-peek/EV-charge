import React from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/common/Card";
import { Users, MapPin, AlertTriangle } from "lucide-react";

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="p-3 bg-red-100 rounded-xl text-red-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <h3 className="text-2xl font-bold">156</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-l-4 border-l-orange-500">
          <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Pending Stations</p>
            <h3 className="text-2xl font-bold">4</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-l-4 border-l-yellow-500">
          <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active Alerts</p>
            <h3 className="text-2xl font-bold">2</h3>
          </div>
        </Card>
      </div>

      <div className="mt-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6">System Management</h3>
        <p className="text-gray-600">This area is restricted to administrators. You can manage station approvals, user reports, and system analytics here.</p>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;