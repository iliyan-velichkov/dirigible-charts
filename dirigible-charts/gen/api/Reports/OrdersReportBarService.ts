import { Controller, Get } from "sdk/http"
import { OrdersReportBarRepository, OrdersReportBarFilter, OrdersReportBarPaginatedFilter } from "../../dao/Reports/OrdersReportBarRepository";
import { HttpUtils } from "../utils/HttpUtils";

@Controller
class OrdersReportBarService {

    private readonly repository = new OrdersReportBarRepository();

    @Get("/")
    public filter(_: any, ctx: any) {
        try {
            const filter: OrdersReportBarPaginatedFilter = {
                Shop: ctx.queryParameters.Shop ? parseInt(ctx.queryParameters.Shop) : undefined,
                StartPeriod: ctx.queryParameters.StartPeriod ? new Date(parseInt(ctx.queryParameters.StartPeriod)) : undefined,
                EndPeriod: ctx.queryParameters.EndPeriod ? new Date(parseInt(ctx.queryParameters.EndPeriod)) : undefined,
                "$limit": ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                "$offset": ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count(_: any, ctx: any) {
        try {
            const filter: OrdersReportBarFilter = {
                Shop: ctx.queryParameters.Shop ? parseInt(ctx.queryParameters.Shop) : undefined,
                StartPeriod: ctx.queryParameters.StartPeriod ? new Date(parseInt(ctx.queryParameters.StartPeriod)) : undefined,
                EndPeriod: ctx.queryParameters.EndPeriod ? new Date(parseInt(ctx.queryParameters.EndPeriod)) : undefined,
            };

            const count = this.repository.count(filter);
            return JSON.stringify(count);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

}