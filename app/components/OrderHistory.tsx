import { useEffect, useState } from "react";
import { Box, VStack } from "@coinbase/cds-web/layout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@coinbase/cds-web/tables";
import { Tag } from "@coinbase/cds-web/tag";
import { Text } from "@coinbase/cds-web/typography";
import { useCoinbaseRampTransaction } from "../contexts/CoinbaseRampTransactionContext";
import { getOrdersByPartnerUserId } from "../queries";
import { Order } from "../types";

export const OrderHistory = () => {
  const { partnerUserId } = useCoinbaseRampTransaction();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: Order["status"]) => {
    if (status === "completed") return "green";
    if (status === "pending") return "yellow";
    return "red";
  };

  useEffect(() => {
    const getOrders = async () => {
      if (partnerUserId) {
        setLoading(true);
        try {
          const fetchedOrders = await getOrdersByPartnerUserId({
            partnerUserId,
          });
          console.info("orders by partner user id", fetchedOrders);
          setOrders(fetchedOrders || []);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    getOrders();
  }, [partnerUserId]);

  return (
    <VStack gap={3} className="order-history w-full p-4">
      <Text as="h2" font="title3">
        Order History
      </Text>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ) : orders.length > 0 ? (
        <Box overflow="auto">
          <Table bordered variant="ruled" accessibilityLabel="Order history">
            <TableCaption>Order history</TableCaption>
            <TableHeader>
              <TableRow backgroundColor="bgAlternate">
                <TableCell title="Date" />
                <TableCell title="Type" />
                <TableCell title="Asset" />
                <TableCell title="Amount" />
                <TableCell title="Status" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={order.id || index}>
                  <TableCell
                    title={new Date(order.created_at).toLocaleDateString()}
                  />
                  <TableCell title={order.type} />
                  <TableCell title={order.asset} />
                  <TableCell title={order.amount} />
                  <TableCell>
                    <Tag colorScheme={getStatusColor(order.status)}>
                      {order.status}
                    </Tag>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Box textAlign="center" padding={4}>
          <Text as="p" color="fgMuted">
            No transaction history found.
          </Text>
          <Text as="p" font="label2" color="fgMuted">
            Complete a transaction to see it here.
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default OrderHistory;
