import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface OrdersEntity {
    readonly Id: number;
    Date?: Date;
    Shop?: number;
    Total?: number;
}

export interface OrdersCreateEntity {
    readonly Date?: Date;
    readonly Shop?: number;
    readonly Total?: number;
}

export interface OrdersUpdateEntity extends OrdersCreateEntity {
    readonly Id: number;
}

export interface OrdersEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Date?: Date | Date[];
            Shop?: number | number[];
            Total?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Date?: Date | Date[];
            Shop?: number | number[];
            Total?: number | number[];
        };
        contains?: {
            Id?: number;
            Date?: Date;
            Shop?: number;
            Total?: number;
        };
        greaterThan?: {
            Id?: number;
            Date?: Date;
            Shop?: number;
            Total?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Shop?: number;
            Total?: number;
        };
        lessThan?: {
            Id?: number;
            Date?: Date;
            Shop?: number;
            Total?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Shop?: number;
            Total?: number;
        };
    },
    $select?: (keyof OrdersEntity)[],
    $sort?: string | (keyof OrdersEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface OrdersEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<OrdersEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class OrdersRepository {

    private static readonly DEFINITION = {
        table: "ORDERS",
        properties: [
            {
                name: "Id",
                column: "ORDERS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Date",
                column: "ORDERS_DATE",
                type: "TIMESTAMP",
            },
            {
                name: "Shop",
                column: "ORDERS_SHOP",
                type: "INTEGER",
            },
            {
                name: "Total",
                column: "ORDERS_TOTAL",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(OrdersRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: OrdersEntityOptions): OrdersEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): OrdersEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: OrdersCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "ORDERS",
            entity: entity,
            key: {
                name: "Id",
                column: "ORDERS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: OrdersUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "ORDERS",
            entity: entity,
            key: {
                name: "Id",
                column: "ORDERS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: OrdersCreateEntity | OrdersUpdateEntity): number {
        const id = (entity as OrdersUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as OrdersUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "ORDERS",
            entity: entity,
            key: {
                name: "Id",
                column: "ORDERS_ID",
                value: id
            }
        });
    }

    public count(options?: OrdersEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "ORDERS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: OrdersEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("dirigible-charts-Orders-Orders", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("dirigible-charts-Orders-Orders").send(JSON.stringify(data));
    }
}
