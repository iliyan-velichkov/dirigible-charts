angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'dirigible-charts.Reports.OrdersReportBar';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
				if (params?.filter?.StartPeriod) {
					params.filter.StartPeriod = new Date(params.filter.StartPeriod);
				}
				if (params?.filter?.EndPeriod) {
					params.filter.EndPeriod = new Date(params.filter.EndPeriod);
				}
				$scope.entity = params.filter ?? {};
				$scope.optionsShop = params.optionsShop;
		}

		$scope.filter = function () {
			const filter = {
				...$scope.entity
			};
			filter.StartPeriod = filter.StartPeriod?.getTime();
			filter.EndPeriod = filter.EndPeriod?.getTime();
			messageHub.postMessage("filter", filter);
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("OrdersReportBar-details-filter");
		};

	}]);