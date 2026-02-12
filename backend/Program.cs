using MachineSimulator.Backend.Models;
using MachineSimulator.Backend.Services;
using MachineSimulator.Backend.Stations;

var simulator = new Simulator();

simulator.AddStation(new LoadingStation());
simulator.AddStation(new AssemblyStation());
simulator.AddStation(new InspectionStation());
simulator.AddStation(new UnloadingStation());

simulator.AddCarrier(new Mover("mover-1"));
simulator.AddCarrier(new Nest("nest-1"));

simulator.Run();
