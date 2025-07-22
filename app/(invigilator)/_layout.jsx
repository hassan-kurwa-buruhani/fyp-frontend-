import { Slot } from 'expo-router';
import Layout from '../template/Layout';

export default function LecturerLayout() {
  return (
    <Layout>
      <Slot />
    </Layout>
  );
}
