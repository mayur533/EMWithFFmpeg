import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import { NativeModules, Platform } from 'react-native';

export interface FFmpegLibraryInfo {
  name: string;
  path: string;
  size: number;
  modified: string;
  isCustom: boolean;
}

export interface FFmpegRuntimeInfo {
  version: string;
  buildInfo: string;
  loadedLibraries: FFmpegLibraryInfo[];
  customLibrariesFound: number;
  prebuiltLibrariesFound: number;
  drawtextAvailable: boolean;
}

export class FFmpegRuntimeDebugger {
  /**
   * Comprehensive runtime debugging for FFmpeg libraries
   */
  static async debugFFmpegRuntime(): Promise<FFmpegRuntimeInfo> {
    console.log("🔍 === FFmpeg Runtime Debugger Starting ===");
    
    const result: FFmpegRuntimeInfo = {
      version: '',
      buildInfo: '',
      loadedLibraries: [],
      customLibrariesFound: 0,
      prebuiltLibrariesFound: 0,
      drawtextAvailable: false
    };

    try {
      // 0. Test basic FFmpeg loading
      console.log("🔍 Testing basic FFmpeg loading...");
      try {
        const testSession = await FFmpegKit.executeAsync("-version");
        const testReturnCode = await testSession.getReturnCode();
        // Get logs using getAllLogs() and convert to string
        let testOutput = 'No logs available';
        try {
          const testLogs = await testSession.getAllLogs();
          if (testLogs && Array.isArray(testLogs)) {
            testOutput = testLogs.map(log => {
              // Handle both string logs and log objects
              if (typeof log === 'string') {
                return log;
              } else if (log && typeof log.getMessage === 'function') {
                return log.getMessage();
              } else if (log && typeof log === 'object') {
                return JSON.stringify(log);
              }
              return String(log);
            }).join('\n');
          }
        } catch (e) {
          console.log('⚠️ Could not get logs:', e);
        }
        
        console.log("✅ FFmpeg basic test - Return Code:", testReturnCode);
        console.log("✅ FFmpeg basic test - Success:", this.isReturnCodeSuccess(testReturnCode));
        console.log("✅ FFmpeg basic test - Output:", testOutput);
        
        if (!testOutput || !testOutput.trim()) {
          console.log("❌ FFmpeg is not returning any output - this indicates a serious problem");
          console.log("❌ Possible causes:");
          console.log("   - FFmpeg libraries are not loaded");
          console.log("   - Wrong FFmpeg version is being used");
          console.log("   - FFmpeg is crashing silently");
        }
      } catch (error) {
        console.log("❌ FFmpeg basic test failed:", error);
      }

      // 1. Test FFmpeg basic functionality
      console.log("🔍 Testing FFmpeg basic functionality...");
      const versionSession = await FFmpegKit.executeAsync("-version");
      // Get logs using getAllLogs() and convert to string
      let versionOutput = 'No logs available';
      try {
        const versionLogs = await versionSession.getAllLogs();
        if (versionLogs && Array.isArray(versionLogs)) {
          versionOutput = versionLogs.map(log => {
            // Handle both string logs and log objects
            if (typeof log === 'string') {
              return log;
            } else if (log && typeof log.getMessage === 'function') {
              return log.getMessage();
            } else if (log && typeof log === 'object') {
              return JSON.stringify(log);
            }
            return String(log);
          }).join('\n');
        }
      } catch (e) {
        console.log('⚠️ Could not get version logs:', e);
      }
      const returnCode = await versionSession.getReturnCode();
      
      console.log("📋 FFmpeg Version Test:");
      console.log("Return Code:", returnCode);
      console.log("Success:", this.isReturnCodeSuccess(returnCode));
      console.log("Output:", versionOutput);
      
      if (versionOutput && versionOutput.trim()) {
        result.version = this.extractVersion(versionOutput);
        result.buildInfo = versionOutput;
        
        console.log("🎯 Detected FFmpeg Version:", result.version);
        console.log("🎯 Is Custom FFmpeg 6.1.1:", result.version.includes('6.1.1'));
        
        // Check for key build features
        const hasFreetype = versionOutput.includes('--enable-libfreetype');
        const hasFontconfig = versionOutput.includes('--enable-fontconfig');
        const hasPostproc = versionOutput.includes('--enable-postproc');
        
        console.log("🔧 Build Features in Version Output:");
        console.log("  - libfreetype:", hasFreetype ? "✅ ENABLED" : "❌ DISABLED");
        console.log("  - fontconfig:", hasFontconfig ? "✅ ENABLED" : "❌ DISABLED");
        console.log("  - postproc:", hasPostproc ? "✅ ENABLED" : "❌ DISABLED");
      } else {
        console.log("⚠️ No version output received - FFmpeg may not be working properly");
        result.version = 'No output';
        result.buildInfo = 'No output';
      }

      // 2. Check drawtext availability
      console.log("🔍 Checking drawtext filter availability...");
      const filtersSession = await FFmpegKit.executeAsync("-filters");
      // Get logs using getAllLogs() and convert to string
      let filtersOutput = 'No logs available';
      try {
        const filtersLogs = await filtersSession.getAllLogs();
        if (filtersLogs && Array.isArray(filtersLogs)) {
          filtersOutput = filtersLogs.map(log => {
            // Handle both string logs and log objects
            if (typeof log === 'string') {
              return log;
            } else if (log && typeof log.getMessage === 'function') {
              return log.getMessage();
            } else if (log && typeof log === 'object') {
              return JSON.stringify(log);
            }
            return String(log);
          }).join('\n');
        }
      } catch (e) {
        console.log('⚠️ Could not get filters logs:', e);
      }
      const filtersReturnCode = await filtersSession.getReturnCode();
      
      console.log("🎬 FFmpeg Filters Test:");
      console.log("Return Code:", filtersReturnCode);
      console.log("Success:", this.isReturnCodeSuccess(filtersReturnCode));
      console.log("Output:", filtersOutput);
      
      if (filtersOutput && filtersOutput.trim()) {
        if (filtersOutput.includes('drawtext')) {
          result.drawtextAvailable = true;
          console.log("✅ Drawtext filter is AVAILABLE");
        } else {
          console.log("❌ Drawtext filter is NOT available");
          console.log("Available filters:", filtersOutput.substring(0, 500) + "...");
        }
      } else {
        console.log("⚠️ No filters output received - FFmpeg may not be working properly");
      }

      // 3. Get detailed build configuration
      console.log("🔍 Getting FFmpeg build configuration...");
      const configSession = await FFmpegKit.executeAsync("-buildconf");
      // Get logs using getAllLogs() and convert to string
      let configOutput = 'No logs available';
      try {
        const configLogs = await configSession.getAllLogs();
        if (configLogs && Array.isArray(configLogs)) {
          configOutput = configLogs.map(log => {
            // Handle both string logs and log objects
            if (typeof log === 'string') {
              return log;
            } else if (log && typeof log.getMessage === 'function') {
              return log.getMessage();
            } else if (log && typeof log === 'object') {
              return JSON.stringify(log);
            }
            return String(log);
          }).join('\n');
        }
      } catch (e) {
        console.log('⚠️ Could not get config logs:', e);
      }
      
      console.log("⚙️ FFmpeg Build Configuration:");
      console.log(configOutput);
      
      // Check for key features
      const hasFreetype = configOutput.includes('--enable-libfreetype');
      const hasFontconfig = configOutput.includes('--enable-fontconfig');
      const hasPostproc = configOutput.includes('--enable-postproc');
      
      console.log("🔧 Build Features:");
      console.log("  - libfreetype:", hasFreetype ? "✅ ENABLED" : "❌ DISABLED");
      console.log("  - fontconfig:", hasFontconfig ? "✅ ENABLED" : "❌ DISABLED");
      console.log("  - postproc:", hasPostproc ? "✅ ENABLED" : "❌ DISABLED");

      // 4. Test drawtext functionality if available
      if (result.drawtextAvailable) {
        console.log("🧪 Testing drawtext functionality...");
        try {
          const testCommand = '-f lavfi -i testsrc=duration=1:size=320x240:rate=1 -vf "drawtext=text=\'Test\':x=10:y=10:fontsize=24:color=white" -t 1 -f null -';
          const testSession = await FFmpegKit.executeAsync(testCommand);
          const testReturnCode = await testSession.getReturnCode();
          const testLogs = await testSession.getAllLogs();
          const testOutput = testLogs.map(log => log.getMessage()).join('\n');
          
          console.log("🧪 Drawtext Test Result:");
          console.log("Return Code:", testReturnCode);
          console.log("Success:", this.isReturnCodeSuccess(testReturnCode));
          console.log("Output:", testOutput);
        } catch (error) {
          console.log("❌ Drawtext test failed:", error);
        }
      }

      // 5. Get library information (Android specific)
      if (Platform.OS === 'android') {
        console.log("🔍 Getting Android library information...");
        await this.getAndroidLibraryInfo(result);
      }

      console.log("🔍 === FFmpeg Runtime Debugger Complete ===");
      
    } catch (error) {
      console.error("❌ FFmpeg Runtime Debug Error:", error);
    }

    return result;
  }

  /**
   * Extract version from FFmpeg output
   */
  private static extractVersion(output: string): string {
    const versionMatch = output.match(/ffmpeg version ([^\s]+)/);
    return versionMatch ? versionMatch[1] : 'Unknown';
  }

  /**
   * Check if return code indicates success (compatibility method)
   */
  private static isReturnCodeSuccess(returnCode: any): boolean {
    try {
      // First, try to get the value if it's a return code object
      if (returnCode && typeof returnCode === 'object') {
        // Try getValue() method first
        if (returnCode.getValue && typeof returnCode.getValue === 'function') {
          const value = returnCode.getValue();
          return value === 0;
        }
        // Check for other common properties
        if (returnCode._h !== undefined) {
          return returnCode._h === 0;
        }
        if (returnCode.value !== undefined) {
          return returnCode.value === 0;
        }
      }
      
      // Try the standard ReturnCode.isSuccess method
      if (ReturnCode.isSuccess && typeof ReturnCode.isSuccess === 'function') {
        return ReturnCode.isSuccess(returnCode);
      }
      
      // If it's a number, check if it's 0
      if (typeof returnCode === 'number') {
        return returnCode === 0;
      }
      
      console.log("⚠️ Unknown return code format:", typeof returnCode, returnCode);
      return false;
    } catch (error) {
      console.log("⚠️ Error checking return code:", error, "Return code:", returnCode);
      return false;
    }
  }

  /**
   * Get Android-specific library information
   */
  private static async getAndroidLibraryInfo(result: FFmpegRuntimeInfo): Promise<void> {
    try {
      // Get library paths using native Android methods
      const libraryInfo = await this.getNativeLibraryInfo();
      
      console.log("📚 Native Library Information:");
      console.log("Library Info:", libraryInfo);
      
      // Parse library information
      if (libraryInfo) {
        const libraries = this.parseLibraryInfo(libraryInfo);
        result.loadedLibraries = libraries;
        
        // Count custom vs prebuilt libraries
        libraries.forEach(lib => {
          if (lib.isCustom) {
            result.customLibrariesFound++;
          } else {
            result.prebuiltLibrariesFound++;
          }
        });
        
        console.log("📊 Library Summary:");
        console.log(`  - Total libraries: ${libraries.length}`);
        console.log(`  - Custom libraries: ${result.customLibrariesFound}`);
        console.log(`  - Prebuilt libraries: ${result.prebuiltLibrariesFound}`);
        
        // Show detailed library info
        libraries.forEach(lib => {
          console.log(`📁 ${lib.name}:`);
          console.log(`    Path: ${lib.path}`);
          console.log(`    Size: ${lib.size} bytes`);
          console.log(`    Modified: ${lib.modified}`);
          console.log(`    Type: ${lib.isCustom ? 'CUSTOM' : 'PREBUILT'}`);
        });
        
        // Show summary from native module
        if (libraryInfo.totalFound !== undefined) {
          console.log("📊 Native Module Summary:");
          console.log(`  - Total found: ${libraryInfo.totalFound}`);
          console.log(`  - Custom found: ${libraryInfo.customFound}`);
          console.log(`  - Prebuilt found: ${libraryInfo.prebuiltFound}`);
        }
      }
      
    } catch (error) {
      console.log("⚠️ Could not get native library info:", error);
    }
  }

  /**
   * Get native library information using the native module
   */
  private static async getNativeLibraryInfo(): Promise<any> {
    try {
      const { FFmpegLibraryDebugger } = NativeModules;
      
      if (!FFmpegLibraryDebugger) {
        console.log("⚠️ FFmpegLibraryDebugger native module not available");
        return null;
      }
      
      console.log("🔍 Getting native library information...");
      
      // Get system info first
      const systemInfo = await FFmpegLibraryDebugger.getSystemInfo();
      console.log("📱 System Info:", systemInfo);
      
      // Get loaded libraries
      const libraryInfo = await FFmpegLibraryDebugger.getLoadedLibraries();
      console.log("📚 Library Info:", libraryInfo);
      
      return libraryInfo;
      
    } catch (error) {
      console.log("❌ Native library info error:", error);
      return null;
    }
  }

  /**
   * Parse library information from native module response
   */
  private static parseLibraryInfo(info: any): FFmpegLibraryInfo[] {
    const libraries: FFmpegLibraryInfo[] = [];
    
    if (info && info.libraries) {
      for (let i = 0; i < info.libraries.length; i++) {
        const lib = info.libraries[i];
        libraries.push({
          name: lib.name,
          path: lib.path,
          size: lib.size,
          modified: lib.modified,
          isCustom: lib.isCustom
        });
      }
    }
    
    return libraries;
  }

  /**
   * Quick FFmpeg version check
   */
  static async getFFmpegVersion(): Promise<string> {
    try {
      const session = await FFmpegKit.executeAsync("-version");
      let output = 'No logs available';
      try {
        const logs = await session.getAllLogs();
        if (logs && Array.isArray(logs)) {
          output = logs.map(log => {
            // Handle both string logs and log objects
            if (typeof log === 'string') {
              return log;
            } else if (log && typeof log.getMessage === 'function') {
              return log.getMessage();
            } else if (log && typeof log === 'object') {
              return JSON.stringify(log);
            }
            return String(log);
          }).join('\n');
        }
      } catch (e) {
        console.log('⚠️ Could not get version logs:', e);
      }
      return this.extractVersion(output);
    } catch (error) {
      console.error("❌ Version check error:", error);
      return 'Error';
    }
  }

  /**
   * Quick drawtext availability check
   */
  static async isDrawtextAvailable(): Promise<boolean> {
    try {
      const session = await FFmpegKit.executeAsync("-filters");
      let output = 'No logs available';
      try {
        const logs = await session.getAllLogs();
        if (logs && Array.isArray(logs)) {
          output = logs.map(log => {
            // Handle both string logs and log objects
            if (typeof log === 'string') {
              return log;
            } else if (log && typeof log.getMessage === 'function') {
              return log.getMessage();
            } else if (log && typeof log === 'object') {
              return JSON.stringify(log);
            }
            return String(log);
          }).join('\n');
        }
      } catch (e) {
        console.log('⚠️ Could not get filters logs:', e);
      }
      return output && output.includes('drawtext');
    } catch (error) {
      console.error("❌ Drawtext check error:", error);
      return false;
    }
  }
}

export default FFmpegRuntimeDebugger;
