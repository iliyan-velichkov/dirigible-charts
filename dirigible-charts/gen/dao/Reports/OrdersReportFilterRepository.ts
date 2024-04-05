import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface OrdersReportFilterEntity {
    readonly Report: string;
    Orders?: number;
    StartPeriod?: Date;
    EndPeriod?: Date;
}

export interface OrdersReportFilterCreateEntity {
    readonly Orders?: number;
    readonly StartPeriod?: Date;
    readonly EndPeriod?: Date;
}

export interface OrdersReportFilterUpdateEntity extends OrdersReportFilterCreateEntity {
    readonly Report: string;
}

export interface OrdersReportFilterEntityOptions {
    $filter?: {
        equals?: {
            Report?: string | string[];
            Orders?: number | number[];
            StartPeriod?: Date | Date[];
            EndPeriod?: Date | Date[];
        };
        notEquals?: {
            Report?: string | string[];
            Orders?: number | number[];
            StartPeriod?: Date | Date[];
            EndPeriod?: Date | Date[];
        };
        contains?: {
            Report?: string;
            Orders?: number;
            StartPeriod?: Date;
            EndPeriod?: Date;
        };
        greaterThan?: {
            Report?: string;
            Orders?: number;
            StartPeriod?: Date;
            EndPeriod?: Date;
        };
        greaterThanOrEqual?: {
            Report?: string;
            Orders?: number;
            StartPeriod?: Date;
            EndPeriod?: Date;
        };
        lessThan?: {
            Report?: string;
            Orders?: number;
            StartPeriod?: Date;
            EndPeriod?: Date;
        };
        lessThanOrEqual?: {
            Report?: string;
            Orders?: number;
            StartPeriod?: Date;
            EndPeriod?: Date;
        };
    },
    $select?: (keyof OrdersReportFilterEntity)[],
    $sort?: string | (keyof OrdersReportFilterEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface OrdersReportFilterEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<OrdersReportFilterEntity>;
    readonly key: {
        name: string;
        column: string;
        value: string;
    }
}

export class OrdersReportFilterRepository {

    private static readonly DEFINITION = {
        table: "ORDERSREPORTFILTER",
        properties: [
            {
                name: "Report",
                column: "ORDERSREPORTFILTER_REPORT",
                type: "VARCHAR",
                id: true,
                autoIncrement: false,
            },
            {
                name: "Orders",
                column: "ORDERSREPORTFILTER_ORDERS",
                type: "INTEGER",
            },
            {
                name: "StartPeriod",
                column: "ORDERSREPORTFILTER_STARTPERIOD",
                type: "DATE",
            },
            {
                name: "EndPeriod",
                column: "ORDERSREPORTFILTER_ENDPERIOD",
                type: "DATE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(OrdersReportFilterRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: OrdersReportFilterEntityOptions): OrdersReportFilterEntity[] {
        return this.dao.list(options).map((e: OrdersReportFilterEntity) => {
            EntityUtils.setDate(e, "StartPeriod");
            EntityUtils.setDate(e, "EndPeriod");
            return e;
        });
    }

    public findById(id: string): OrdersReportFilterEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "StartPeriod");
        EntityUtils.setDate(entity, "EndPeriod");
        return entity ?? undefined;
    }

    public create(entity: OrdersReportFilterCreateEntity): string {
        EntityUtils.setLocalDate(entity, "StartPeriod");
        EntityUtils.setLocalDate(entity, "EndPeriod");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "ORDERSREPORTFILTER",
            entity: entity,
            key: {
                name: "Report",
                column: "ORDERSREPORTFILTER_REPORT",
                value: id
            }
        });
        return id;
    }

    public update(entity: OrdersReportFilterUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "StartPeriod");
        // EntityUtils.setLocalDate(entity, "EndPeriod");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "ORDERSREPORTFILTER",
            entity: entity,
            key: {
                name: "Report",
                column: "ORDERSREPORTFILTER_REPORT",
                value: entity.Report
            }
        });
    }

    public upsert(entity: OrdersReportFilterCreateEntity | OrdersReportFilterUpdateEntity): string {
        const id = (entity as OrdersReportFilterUpdateEntity).Report;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as OrdersReportFilterUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: string): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "ORDERSREPORTFILTER",
            entity: entity,
            key: {
                name: "Report",
                column: "ORDERSREPORTFILTER_REPORT",
                value: id
            }
        });
    }

    public count(options?: OrdersReportFilterEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "ORDERSREPORTFILTER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: OrdersReportFilterEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("dirigible-charts-Reports-OrdersReportFilter", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("dirigible-charts-Reports-OrdersReportFilter").send(JSON.stringify(data));
    }
}
