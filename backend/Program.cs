using Microsoft.Extensions.Logging;
using MachineSimulator.Backend.Services;

var verbose = args.Contains("--verbose");

using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .SetMinimumLevel(verbose ? LogLevel.Debug : LogLevel.Information)
        .AddConsole();
});

var simulator = new Simulator(loggerFactory);
await simulator.Run();
