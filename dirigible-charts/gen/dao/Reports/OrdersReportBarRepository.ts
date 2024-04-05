import { database } from "sdk/db";

export interface OrdersReportBar {
    readonly Project: string;
    readonly Total: number;
}

export interface OrdersReportBarFilter {
}

export interface OrdersReportBarPaginatedFilter extends OrdersReportBarFilter {
    readonly "$limit"?: number;
    readonly "$offset"?: number;
}

export class OrdersReportBarRepository {

    private readonly datasourceName?: string;

    constructor(datasourceName?: string) {
        this.datasourceName = datasourceName;
    }

    public findAll(filter: OrdersReportBarPaginatedFilter): OrdersReportBar[] {
        const data: OrdersReportBar[] = [];
        let connection;
        try {
            connection = database.getConnection(this.datasourceName);

            const sql = `
                SELECT ORDERS_SHOP, COUNT(*) AS ORDERS_COUNT FROM "ORDERS" group by ORDERS_SHOP
            `;

            const statement = connection.prepareStatement(sql);

            let paramIndex = 1;
            if (filter["$limit"]) {
                statement.setInt(paramIndex++, filter["$limit"]);
            }
            if (filter["$offset"]) {
                statement.setInt(paramIndex++, filter["$offset"]);
            }

            const resultSet = statement.executeQuery();
            while (resultSet.next()) {
                data.push({
                    Project: resultSet.getString("Project"),
                    Total: resultSet.getDouble("Total")
                });
            }
            resultSet.close();
            statement.close();
        } finally {
            if (connection) {
                connection.close();
            }
        }
        return data;
    }

    public count(filter: OrdersReportBarFilter): number {
        let count = 0;
        let connection;
        try {
            connection = database.getConnection(this.datasourceName);

            const sql = `
                SELECT COUNT(*) AS ORDERS_COUNT FROM "ORDERS" group by ORDERS_SHOP
            `;

            const statement = connection.prepareStatement(sql);

            let paramIndex = 1;

            const resultSet = statement.executeQuery();
            while (resultSet.next()) {
                count = resultSet.getInt(1);
            }
            resultSet.close();
            statement.close();
        } finally {
            if (connection) {
                connection.close();
            }
        }
        return count;
    }
}