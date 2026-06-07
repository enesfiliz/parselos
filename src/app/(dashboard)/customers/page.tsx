import { CustomersPanel } from "@/components/features/customers/CustomersPanel";
import { getCustomersList } from "@/lib/clients/server-queries";

export default async function CustomersPage() {
  const customers = await getCustomersList();

  return <CustomersPanel initialCustomers={customers} />;
}
