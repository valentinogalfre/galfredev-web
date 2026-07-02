import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { ProfileForm } from '@/components/profile/profile-form'
import { ProfileView } from '@/components/profile/profile-view'
import { getCurrentUserContext } from '@/lib/user-context'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Perfil',
  description:
    'Espacio personal para completar o editar el contexto comercial y técnico antes de avanzar con una propuesta de GalfreDev.',
  alternates: {
    canonical: '/perfil',
  },
  robots: {
    index: false,
    follow: false,
  },
}

type ProfilePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const userContext = await getCurrentUserContext()

  if (!userContext) {
    redirect('/login')
  }

  const params = await searchParams
  const isEditMode = params.edit === '1'

  // Show the wizard if: profile is incomplete OR user explicitly requested edit mode
  const showForm = !userContext.authUser.hasCompletedProfile || isEditMode

  return (
    <>
      <SiteHeader />
      <main id="contenido-principal" className="px-4 pb-18 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-5xl">
          {showForm ? (
            <ProfileForm
              email={userContext.authUser.email}
              providerLabel={userContext.authUser.providerLabel}
              initialValues={userContext.initialProfileState}
              mode={userContext.authUser.hasCompletedProfile ? 'edit' : 'onboarding'}
              fallbackAvatarUrl={userContext.authUser.avatarUrl}
            />
          ) : (
            <ProfileView
              authUser={userContext.authUser}
              bundle={userContext.profileBundle}
            />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
