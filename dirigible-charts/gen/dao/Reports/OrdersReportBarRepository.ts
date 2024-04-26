import { database } from "sdk/db";

export interface OrdersReportBar {
    readonly OrderDate: Date;
    readonly Total: number;
}

export interface OrdersReportBarFilter {
    readonly Shop?: number;
    readonly StartPeriod?: Date;
    readonly EndPeriod?: Date;
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
                select o.ORDERS_DATE as "OrderDate", sum(o.ORDERS_TOTAL) as "Total" from ORDERS o join "SHOP" s on o.ORDERS_SHOP = s.SHOP_ID ${     filter.Shop && filter.StartPeriod && filter.EndPeriod ?         `where s.SHOP_ID = ? and o.ORDERS_DATE >= ? and o.ORDERS_DATE <= ?`     :     filter.Shop && filter.StartPeriod ?         `where s.SHOP_ID = ? and o.ORDERS_DATE >= ?`     :     filter.Shop && filter.EndPeriod ?         `where s.SHOP_ID = ? and o.ORDERS_DATE <= ?`     :     filter.StartPeriod && filter.EndPeriod ?         `where o.ORDERS_DATE >= ? and o.ORDERS_DATE <= ? `     :     filter.Shop ?         `where s.SHOP_ID = ?`     :     filter.StartPeriod ?         `where o.ORDERS_DATE >= ?`     :     filter.EndPeriod ?         `where o.ORDERS_DATE <= ?`     :         '' } group by s.SHOP_NAME, o.ORDERS_DATE ${     filter["$limit"] && filter["$offset"] ?         'limit ? offset ?'     :     filter["$limit"] ?         'limit ?'     :     filter["$offset"] ?         'offset ?'     :         '' }
            `;

            const statement = connection.prepareStatement(sql);

            let paramIndex = 1;
            if (filter.Shop) {
                statement.setInt(paramIndex++, filter.Shop);
            }
            if (filter.StartPeriod) {
                statement.setDate(paramIndex++, filter.StartPeriod);
            }
            if (filter.EndPeriod) {
                statement.setDate(paramIndex++, filter.EndPeriod);
            }
            if (filter["$limit"]) {
                statement.setInt(paramIndex++, filter["$limit"]);
            }
            if (filter["$offset"]) {
                statement.setInt(paramIndex++, filter["$offset"]);
            }

            const resultSet = statement.executeQuery();
            while (resultSet.next()) {
                data.push({
                    OrderDate: resultSet.getDate("OrderDate"),
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
                select count(*) from (     select o.ORDERS_DATE as "OrderDate", sum(o.ORDERS_TOTAL) as "Total"     from ORDERS o     join "SHOP" s on o.ORDERS_SHOP = s.SHOP_ID     ${         filter.Shop && filter.StartPeriod && filter.EndPeriod ?             `where s.SHOP_ID = ? and o.ORDERS_DATE >= ? and o.ORDERS_DATE <= ?`         :         filter.Shop && filter.StartPeriod ?             `where s.SHOP_ID = ? and o.ORDERS_DATE >= ?`         :         filter.Shop && filter.EndPeriod ?             `where s.SHOP_ID = ? and o.ORDERS_DATE <= ?`         :         filter.StartPeriod && filter.EndPeriod ?             `where o.ORDERS_DATE >= ? and o.ORDERS_DATE <= ? `         :         filter.Shop ?             `where s.SHOP_ID = ?`         :         filter.StartPeriod ?             `where o.ORDERS_DATE >= ?`         :         filter.EndPeriod ?             `where o.ORDERS_DATE <= ?`         :             ''     }     group by s.SHOP_NAME, o.ORDERS_DATE )
            `;

            const statement = connection.prepareStatement(sql);

            let paramIndex = 1;
            if (filter.Shop) {
                statement.setInt(paramIndex++, filter.Shop);
            }
            if (filter.StartPeriod) {
                statement.setDate(paramIndex++, filter.StartPeriod);
            }
            if (filter.EndPeriod) {
                statement.setDate(paramIndex++, filter.EndPeriod);
            }

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