'use client'

import { BotChat, type BotChatProps } from '@/components/demos/bot-chat'
import { createLiveTransport } from '@/components/demos/bot-transport'
import { useMemo } from 'react'

type BotChatLiveProps = Omit<BotChatProps, 'sendMessage'>

/**
 * Wrapper client delgado: construye el transporte real (createLiveTransport)
 * y lo inyecta en BotChat. Existe porque BotDemoSection es server component y
 * una función no puede cruzar la frontera server→client como prop.
 */
export function BotChatLive(props: BotChatLiveProps) {
  const sendMessage = useMemo(() => createLiveTransport(props.locale), [props.locale])
  return <BotChat {...props} sendMessage={sendMessage} />
}
