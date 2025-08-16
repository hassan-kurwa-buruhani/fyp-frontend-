import { Slot } from 'expo-router';
import Layout from '../template/Layout';

export default function StudentLayout() {
  return (
    <Layout>
      <Slot />
    </Layout>
  );
}
