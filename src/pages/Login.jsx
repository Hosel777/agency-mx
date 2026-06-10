import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { createDemoRequest } from '../services/api'
import toast from 'react-hot-toast'
import { Loader2, Zap } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'Credenciales inválidas'
        : error.message)
      return
    }

    if (isRegister) {
      toast.success('Cuenta creada — revisa tu correo para confirmar')
    } else {
      toast.success('Sesión iniciada')
      navigate('/')
      window.location.reload()
    }
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex items-center justify-center font-body-md relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <main className="z-10 w-full max-w-md px-6 py-12">
        <div className="glass-card rounded-2xl shadow-2xl p-8 flex flex-col items-center">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-container-highest mb-4 shadow-inner border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            </div>
            <h1 className="font-h2 text-h2 font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Agency MX</h1>
            <p className="font-label-md text-label-md text-on-surface-variant mt-1">Enterprise AI Marketing</p>
          </div>

          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="email">Email Address</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-outline">mail</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-all font-body-md"
                  placeholder="name@agency-mx.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="password">Password</label>
                <a className="font-label-sm text-label-sm text-primary hover:underline transition-all" href="#">Forgot password?</a>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-outline">lock</span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-all font-body-md"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 px-1">
              <input className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary" id="remember" type="checkbox" />
              <label className="font-label-md text-label-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember this device</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-4"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              <span className="font-label-md text-label-md">{isRegister ? 'Create Account' : 'Sign In'}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          <div className="w-full mt-8 flex items-center space-x-4">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="font-label-sm text-label-sm text-outline uppercase">or continue with</span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-6">
            <button className="flex items-center justify-center space-x-2 py-3 bg-surface-container border border-outline-variant rounded-xl hover:bg-surface-container-high transition-colors">
              <svg className="w-5 h-5 text-on-surface" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
              </svg>
              <span className="font-label-md text-label-md">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-2 py-3 bg-surface-container border border-outline-variant rounded-xl hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[20px]">terminal</span>
              <span className="font-label-md text-label-md">SSO</span>
            </button>
          </div>

          <p className="mt-10 font-body-md text-body-md text-on-surface-variant">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-primary font-bold hover:underline ml-1 transition-all">
              {isRegister ? 'Sign In' : 'Create account'}
            </button>
          </p>

          <div className="mt-6 pt-6 border-t border-outline-variant/20 w-full">
            <button
              onClick={async () => {
                const result = await createDemoRequest()
                if (result.success) {
                  toast.success('Demo creada — iniciá sesión para verla')
                }
              }}
              className="w-full py-3 rounded-xl font-label-md text-label-md text-secondary border border-secondary/30 hover:bg-secondary/10 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Demo Rápida ⚡ (sin registro)
            </button>
          </div>
        </div>

        <div className="flex justify-center space-x-6 mt-8">
          <a className="font-label-sm text-label-sm text-outline hover:text-on-surface-variant transition-colors" href="#">Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-outline hover:text-on-surface-variant transition-colors" href="#">Terms of Service</a>
          <a className="font-label-sm text-label-sm text-outline hover:text-on-surface-variant transition-colors" href="#">Support</a>
        </div>
      </main>
    </div>
  )
}
