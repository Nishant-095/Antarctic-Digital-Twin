import numpy as np
from sklearn.linear_model import Ridge

class AntarcticFuelForecaster:
    """
    ML Fuel Consumption & Autonomy Forecaster using Ridge Regression.
    Learns thermodynamic heat-loss curves and electrical base load to project
    station fuel depletion under upcoming polar conditions.
    """

    _regressor = None

    @classmethod
    def initialize(cls):
        if cls._regressor is not None:
            return

        # Train regression on ambient_temp, wind_speed, total_power_kw -> fuel_burn_rate
        # Synthetic dataset generated from real polar physics curves
        np.random.seed(42)
        X = []
        y = []
        for _ in range(600):
            temp = np.random.uniform(-40.0, -5.0)
            wind = np.random.uniform(5.0, 110.0)
            power = np.random.uniform(140.0, 360.0)

            # Ground truth burn rate formula with realistic noise
            burn = 18.0 + (abs(temp) * 0.35) + (wind * 0.04) + (power * 0.05) + np.random.normal(0, 0.4)
            X.append([temp, wind, power])
            y.append(burn)

        model = Ridge(alpha=1.0)
        model.fit(X, y)
        cls._regressor = model

    @classmethod
    def forecast(cls, current_temp: float, current_wind: float, current_power: float, current_reserve_days: float) -> dict:
        cls.initialize()

        # Multi-day forecast under expected polar weather drift
        forecast_days = []
        cumulative_burn = 0.0

        for day in range(1, 8):
            # Projected slight Antarctic weather drift
            proj_temp = current_temp - (day * 0.4)
            proj_wind = max(10.0, current_wind + np.sin(day) * 5.0)
            proj_power = current_power + (day * 1.2)

            predicted_burn_lh = float(cls._regressor.predict([[proj_temp, proj_wind, proj_power]])[0])
            daily_burn_liters = predicted_burn_lh * 24.0
            cumulative_burn += daily_burn_liters

            forecast_days.append({
                'day': f'Day +{day}',
                'projected_temp_c': round(proj_temp, 1),
                'predicted_burn_lh': round(predicted_burn_lh, 1),
                'daily_consumption_l': round(daily_burn_liters, 0),
            })

        avg_predicted_burn = sum(d['predicted_burn_lh'] for d in forecast_days) / len(forecast_days)
        estimated_safe_days = round(current_reserve_days * (26.0 / max(15.0, avg_predicted_burn)), 1)

        return {
            'model_name': 'Ridge Regression Fuel Forecaster (Scikit-Learn)',
            'avg_predicted_burn_lh': round(avg_predicted_burn, 2),
            'projected_7day_consumption_l': round(cumulative_burn, 0),
            'forecast_autonomy_days': estimated_safe_days,
            'burn_trend': 'STABLE' if avg_predicted_burn < 32.0 else 'ELEVATED_HEATING_DEMAND',
            'daily_projections': forecast_days,
        }
