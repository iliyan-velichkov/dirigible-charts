import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ShopEntity {
    readonly Id: number;
    Name?: string;
}

export interface ShopCreateEntity {
    readonly Name?: string;
}

export interface ShopUpdateEntity extends ShopCreateEntity {
    readonly Id: number;
}

export interface ShopEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof ShopEntity)[],
    $sort?: string | (keyof ShopEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ShopEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ShopEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ShopRepository {

    private static readonly DEFINITION = {
        table: "SHOP",
        properties: [
            {
                name: "Id",
                column: "SHOP_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "SHOP_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ShopRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ShopEntityOptions): ShopEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ShopEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ShopCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "SHOP",
            entity: entity,
            key: {
                name: "Id",
                column: "SHOP_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ShopUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "SHOP",
            entity: entity,
            key: {
                name: "Id",
                column: "SHOP_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ShopCreateEntity | ShopUpdateEntity): number {
        const id = (entity as ShopUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ShopUpdateEntity);
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
            table: "SHOP",
            entity: entity,
            key: {
                name: "Id",
                column: "SHOP_ID",
                value: id
            }
        });
    }

    public count(options?: ShopEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "SHOP"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ShopEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("dirigible-charts-Orders-Shop", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("dirigible-charts-Orders-Shop").send(JSON.stringify(data));
    }
}
