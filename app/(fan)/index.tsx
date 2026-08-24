// app/(fan)/index.tsx — Default entry for (fan) tab group
import { Redirect } from 'expo-router'

export default function FanIndex() {
  return <Redirect href="/(fan)/feed" />
}
