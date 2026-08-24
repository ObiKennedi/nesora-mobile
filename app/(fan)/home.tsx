// app/(fan)/home.tsx — Alias for fan feed
import { Redirect } from 'expo-router'

export default function FanHome() {
  return <Redirect href="/(fan)/feed" />
}
