angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'dirigible-charts.Reports.OrdersReportFilter';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/dirigible-charts/gen/api/Reports/OrdersReportFilterService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'entityApi', function ($scope, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		if (window != null && window.frameElement != null && window.frameElement.hasAttribute("data-parameters")) {
			let dataParameters = window.frameElement.getAttribute("data-parameters");
			if (dataParameters) {
				let params = JSON.parse(dataParameters);
				if (params?.entity?.StartPeriodFrom) {
					params.entity.StartPeriodFrom = new Date(params.entity.StartPeriodFrom);
				}
				if (params?.entity?.StartPeriodTo) {
					params.entity.StartPeriodTo = new Date(params.entity.StartPeriodTo);
				}
				if (params?.entity?.EndPeriodFrom) {
					params.entity.EndPeriodFrom = new Date(params.entity.EndPeriodFrom);
				}
				if (params?.entity?.EndPeriodTo) {
					params.entity.EndPeriodTo = new Date(params.entity.EndPeriodTo);
				}
				$scope.entity = params.entity ?? {};
				$scope.selectedMainEntityKey = params.selectedMainEntityKey;
				$scope.selectedMainEntityId = params.selectedMainEntityId;
			}
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Report) {
				filter.$filter.contains.Report = entity.Report;
			}
			if (entity.Orders) {
				filter.$filter.equals.Orders = entity.Orders;
			}
			if (entity.StartPeriodFrom) {
				filter.$filter.greaterThanOrEqual.StartPeriod = entity.StartPeriodFrom;
			}
			if (entity.StartPeriodTo) {
				filter.$filter.lessThanOrEqual.StartPeriod = entity.StartPeriodTo;
			}
			if (entity.EndPeriodFrom) {
				filter.$filter.greaterThanOrEqual.EndPeriod = entity.EndPeriodFrom;
			}
			if (entity.EndPeriodTo) {
				filter.$filter.lessThanOrEqual.EndPeriod = entity.EndPeriodTo;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("OrdersReportFilter-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);