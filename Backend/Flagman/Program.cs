using Flagman.Application;
using Flagman.Endpoints;
using Flagman.Extensions;
using Flagman.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration)
    .AddPresentation();

var app = builder.Build();

app.UseExceptionHandler();

app.UseSwagger();
app.UseSwaggerUI();

await app.ApplyMigrationsAsync();

app.MapEndpoints();
app.Run();  
