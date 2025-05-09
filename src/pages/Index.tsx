
import { useState } from 'react';
import RegisterForm from '@/components/RegisterForm';
import TransactionForm from '@/components/TransactionForm';
import BlockchainStatus from '@/components/BlockchainStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const [activeTab, setActiveTab] = useState("register");

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 shadow-md">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">SecureID-Chain</h1>
              <p className="text-blue-100">Blockchain Identity & Transaction System</p>
            </div>
            <div className="flex space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <div className="text-sm text-blue-100">Network Active</div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs 
              defaultValue="register" 
              className="w-full" 
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="register">Register Identity</TabsTrigger>
                <TabsTrigger value="transact">Send Transaction</TabsTrigger>
              </TabsList>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
              <TabsContent value="transact">
                <TransactionForm />
              </TabsContent>
            </Tabs>
            
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">How It Works</h2>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="h-8 w-8 bg-blue-100 text-blue-800 font-bold rounded-full flex items-center justify-center mb-3">1</div>
                  <h3 className="font-semibold mb-2">Register Identity</h3>
                  <p className="text-sm text-gray-600">Submit ID and selfie to verify your identity and create a unique token</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="h-8 w-8 bg-blue-100 text-blue-800 font-bold rounded-full flex items-center justify-center mb-3">2</div>
                  <h3 className="font-semibold mb-2">Create Wallet</h3>
                  <p className="text-sm text-gray-600">Your public/private keys are generated to secure your transactions</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="h-8 w-8 bg-blue-100 text-blue-800 font-bold rounded-full flex items-center justify-center mb-3">3</div>
                  <h3 className="font-semibold mb-2">Send Transactions</h3>
                  <p className="text-sm text-gray-600">Sign transactions with your private key and identity token</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <BlockchainStatus />
            
            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold mb-2">Security Features</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-2 mt-0.5">✓</div>
                  <span>Digital signatures verify transaction authenticity</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-2 mt-0.5">✓</div>
                  <span>Blockchain ensures transaction immutability</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-2 mt-0.5">✓</div>
                  <span>Fraud detection flags suspicious activity</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-2 mt-0.5">✓</div>
                  <span>Identity verification prevents impersonation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-blue-900 text-center py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-200 text-sm">
            SecureID-Chain Blockchain System - Hackathon Demo
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
