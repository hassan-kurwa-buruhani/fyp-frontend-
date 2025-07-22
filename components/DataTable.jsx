import { View, Text, ScrollView, StyleSheet } from 'react-native';

export const DataTable = ({ headers, data }) => {
  return (
    <ScrollView horizontal style={{ marginBottom: 20 }}>
      <View>
        {/* Table Header */}
        <View style={styles.headerRow}>
          {headers.map((header, index) => (
            <View key={index} style={[
              styles.headerCell,
              { width: header.width || 'auto' }
            ]}>
              <Text style={styles.headerText}>{header.label}</Text>
            </View>
          ))}
        </View>
        
        {/* Table Rows */}
        {data.map((row, rowIndex) => (
          <View 
            key={rowIndex} 
            style={[
              styles.dataRow,
              { backgroundColor: rowIndex % 2 === 0 ? colors.surface : colors.background }
            ]}
          >
            {headers.map((header, cellIndex) => (
              <View 
                key={cellIndex} 
                style={[
                  styles.dataCell,
                  { width: header.width || 'auto' }
                ]}
              >
                <Text style={styles.dataText}>{row[header.key]}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    padding: 12,
    justifyContent: 'center',
  },
  headerText: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dataCell: {
    padding: 12,
    justifyContent: 'center',
  },
  dataText: {
    color: colors.textPrimary,
  },
});