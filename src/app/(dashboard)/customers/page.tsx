import { CustomersPanel } from "@/components/features/customers/CustomersPanel";
import { getCustomersList } from "@/lib/clients/server-queries";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomersList();

  return <CustomersPanel initialCustomers={customers} />;
}
