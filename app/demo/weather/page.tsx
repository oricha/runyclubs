import { Suspense } from "react";

import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { WeatherWidgetSkeleton } from "@/components/weather/WeatherWidgetSkeleton";
import { Container } from "@/components/common/Container";
import { CITY_DETAILS } from "@/lib/cities";

export default function WeatherDemoPage() {
  const madrid = CITY_DETAILS.find((c) => c.slug === "madrid")!;

  return (
    <Container className="max-w-sm py-8">
      <h1 className="mb-6 text-2xl font-bold">Demo Clima</h1>
      <Suspense fallback={<WeatherWidgetSkeleton />}>
        <WeatherWidget lat={madrid.lat} lng={madrid.lng} cityName={madrid.name} />
      </Suspense>
    </Container>
  );
}
