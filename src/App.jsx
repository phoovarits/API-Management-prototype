import { useState } from 'react'
import CustomerList from './pages/CustomerList.jsx'
import CreateCustomer from './pages/CreateCustomer.jsx'
import KeysGenerated from './pages/KeysGenerated.jsx'
import { mockCustomers } from './data/mockCustomers.js'

export default function App() {
  const [tab, setTab] = useState('list') // list | create | keys
  const [customers, setCustomers] = useState(mockCustomers)
  const [keysView, setKeysView] = useState(null) // { customer, keys }

  const updateCustomer = (id, patch) => {
    setCustomers((cs) => cs.map((c) => (c._id === id ? { ...c, ...patch } : c)))
  }
  const deleteCustomer = (id) => {
    setCustomers((cs) => cs.filter((c) => c._id !== id))
  }
  const createCustomer = (customer) => {
    setCustomers((cs) => [customer, ...cs])
  }
  const showKeys = (customer, keys) => {
    setKeysView({ customer, keys })
    setTab('keys')
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">CREDEN</span>
          <span className="brand-sub">API Management</span>
          <span className="proto-pill">prototype</span>
        </div>
        <nav className="tabs">
          <button className={'tab' + (tab === 'list' ? ' active' : '')} onClick={() => setTab('list')}>
            รายชื่อลูกค้า
          </button>
          <button className={'tab' + (tab === 'create' ? ' active' : '')} onClick={() => setTab('create')}>
            + สร้าง Customer API
          </button>
        </nav>
      </header>

      <main className="main">
        {tab === 'list' && (
          <CustomerList
            customers={customers}
            onUpdate={updateCustomer}
            onDelete={deleteCustomer}
            onShowKeys={showKeys}
          />
        )}
        {tab === 'create' && (
          <CreateCustomer
            existingNames={customers.map((c) => c.customer_name)}
            onCreate={createCustomer}
            onShowKeys={showKeys}
          />
        )}
        {tab === 'keys' && keysView && (
          <KeysGenerated
            customer={keysView.customer}
            keys={keysView.keys}
            onDone={() => {
              setKeysView(null)
              setTab('list')
            }}
          />
        )}
      </main>
    </div>
  )
}
