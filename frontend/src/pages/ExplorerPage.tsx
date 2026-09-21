import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Orbit,
  ExternalLink,
  Eye,
  RefreshCw,
} from 'lucide-react';
import asteroidApi from '../services/api';
import { AsteroidListResponse, AsteroidSummary } from '../types/asteroid';

interface ExplorerPageProps {
  onSelectAsteroid: (asteroidId: string) => void;
  onAnalyzeAsteroid: (asteroid: AsteroidSummary) => void;
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({
  onSelectAsteroid,
  onAnalyzeAsteroid,
}) => {
  const [data, setData] = useState<AsteroidListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hazardFilter, setHazardFilter] = useState('all');
  const [sortBy, setSortBy] = useState('estimated_diameter_km');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const fetchAsteroids = async () => {
    try {
      setLoading(true);
      const res = await asteroidApi.getAsteroids({
        search: search.trim() || undefined,
        hazard_filter: hazardFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: pageSize,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load asteroids catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsteroids();
  }, [page, hazardFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAsteroids();
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Search className="w-4 h-4 text-cyan-400" />
            <span>NEAR-EARTH OBJECT CATALOG EXPLORER</span>
          </div>
          <h1 className="font-space font-extrabold text-2xl sm:text-3xl text-white">
            Planetary Asteroid Catalog
          </h1>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span>
            Showing <strong className="text-white">{data?.total_count.toLocaleString() || 0}</strong> cataloged asteroids
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID (e.g. Apophis, 99942, Apollo)..."
            className="w-full bg-slate-950/90 border border-slate-700 rounded-xl pl-9 pr-20 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Hazard Filter Buttons */}
          <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs font-mono">
            <button
              onClick={() => {
                setHazardFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors ${
                hazardFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Objects
            </button>
            <button
              onClick={() => {
                setHazardFilter('hazardous');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors ${
                hazardFilter === 'hazardous'
                  ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-500/40'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Hazardous Only
            </button>
            <button
              onClick={() => {
                setHazardFilter('non_hazardous');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors ${
                hazardFilter === 'non_hazardous'
                  ? 'bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/40'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Non-Hazardous
            </button>
          </div>

          <button
            onClick={fetchAsteroids}
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3.5 px-4 font-semibold">ASTEROID ID / NAME</th>
                <th
                  onClick={() => handleSortChange('estimated_diameter_km')}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-cyan-300"
                >
                  <div className="flex items-center space-x-1">
                    <span>DIAMETER (km)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortChange('relative_velocity_kms')}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-cyan-300"
                >
                  <div className="flex items-center space-x-1">
                    <span>VELOCITY (km/s)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortChange('miss_distance_km')}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-cyan-300"
                >
                  <div className="flex items-center space-x-1">
                    <span>MISS DISTANCE</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">ORBIT FAMILY</th>
                <th className="py-3.5 px-4 font-semibold">HAZARD STATUS</th>
                <th className="py-3.5 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    <div className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Loading catalog records...</div>
                  </td>
                </tr>
              ) : data?.asteroids.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    No asteroids matching the search query or filter.
                  </td>
                </tr>
              ) : (
                data?.asteroids.map((ast) => (
                  <tr
                    key={ast.id}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => onSelectAsteroid(ast.id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {ast.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        ID: {ast.id} • Disc: {ast.discovery_year}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {ast.estimated_diameter_km.toFixed(3)} km
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {ast.relative_velocity_kms.toFixed(2)} km/s
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{ast.miss_distance_au.toFixed(4)} AU</div>
                      <div className="text-[10px] text-slate-400">
                        ({ast.miss_distance_km.toLocaleString()} km)
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {ast.orbit_class || 'Apollo'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {ast.is_hazardous === 1 ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          <ShieldAlert className="w-3 h-3" />
                          <span>POTENTIALLY HAZARDOUS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <ShieldCheck className="w-3 h-3" />
                          <span>NON-HAZARDOUS</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsteroid(ast.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 text-slate-300 text-[11px] font-semibold transition-all inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && data.total_pages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950/60">
            <div>
              Page <strong className="text-white">{data.page}</strong> of{' '}
              <strong className="text-white">{data.total_pages}</strong>
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span>{page}</span>

              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
