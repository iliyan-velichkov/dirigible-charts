angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'dirigible-charts.Reports.OrdersReportBar';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/dirigible-charts/gen/api/Reports/OrdersReportBarService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'entityApi', function ($scope, messageHub, entityApi) {

		$scope.filter = {};

		const ctx = document.getElementById('myChart');
		const myChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: [],
				datasets: []
			}
		});

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("filter", function (msg) {
			$scope.filter = msg.data;
			$scope.loadPage();
		});
		//-----------------Events-------------------//

		$scope.loadPage = function () {
			entityApi.count($scope.filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("OrdersReportBar", `Unable to count OrdersReportBar: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				entityApi.list($scope.filter).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("OrdersReportBar", `Unable to list OrdersReportBar: '${response.message}'`);
						return;
					}
					$scope.data = response.data;
					myChart.data.labels = $scope.data.map(e => e.Project);
					myChart.data.datasets = [
						{
							label: 'Total',
							data: $scope.data.map(e => e.Total),
							borderWidth: 1
						},
					];
					myChart.canvas.parentNode.style.height = '90%';
					myChart.update();
				});
			});
		};
		$scope.loadPage();

		$scope.openFilter = function () {
			messageHub.showDialogWindow("OrdersReportBar-details-filter", {
				action: "filter",
				filter: $scope.filter,
			});
		};


	}]);
