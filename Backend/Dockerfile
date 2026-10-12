FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Backend/Flagman.Domain/Flagman.Domain.csproj Backend/Flagman.Domain/
COPY Backend/Flagman.Application/Flagman.Application.csproj Backend/Flagman.Application/
COPY Backend/Flagman.Infrastructure/Flagman.Infrastructure.csproj Backend/Flagman.Infrastructure/
COPY Backend/Flagman/Flagman.csproj Backend/Flagman/

RUN dotnet restore Backend/Flagman/Flagman.csproj

COPY Backend/ Backend/
RUN dotnet publish Backend/Flagman/Flagman.csproj \
	--configuration Release \
	--output /app/publish \
	--no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Flagman.dll"]
