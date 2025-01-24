# bitcoin inflation - How to generate annual inflation data

# import matplotlib.pyplot as plt
# from matplotlib import ticker
import numpy as np
import pandas as pd

# class

class InflationPerHalving:

    halving_blocks = 210000
    blocks_per_year = 6 * 24 * 365

    def __init__(self, halving):
        self.halving = halving
    
    def inflationBlock(self, btc_mined, issue):
        self.inflation_list = np.empty((self.halving_blocks,), dtype=float)
        for n in range(0, self.halving_blocks):
            new_btc_mined = issue * n
            inflation_rate = issue / (new_btc_mined + btc_mined)
            self.inflation_list[n] = inflation_rate
        return self.inflation_list
    
    def inflationFirstYear(self, inflation_list):
        self.inf_rate_first_year = 1
        for i in range(0, self.blocks_per_year):
            self.inf_rate_first_year = (1 + inflation_list[i]) * self.inf_rate_first_year
        
        self.inflation_first_year = (self.inf_rate_first_year - 1) * 100
        self.inflation_first_year = round(self.inflation_first_year, 0)
        return self.inflation_first_year, self.inf_rate_first_year
    
    def inflationDayAfterHalving(self, inf_list_two_halvings):
        self.inf_rate_after_halving = 1
        for i in range(self.halving_blocks - self.blocks_per_year + 1, self.halving_blocks + 1):
            self.inf_rate_after_halving = (1 + inf_list_two_halvings[i]) * self.inf_rate_after_halving
        
        self.inflation_after_halving = (self.inf_rate_after_halving - 1) * 100
        self.inflation_after_halving = round(self.inflation_after_halving, 2)
        return self.inflation_after_halving, self.inf_rate_after_halving
    
    def inflationPeriod(self, start_block, end_block, inflation_rate, inflation_list):
        self.inflation_rate = inflation_rate * (1 + inflation_list[end_block]) / (1 + inflation_list[start_block])
        self.inflation_year = (self.inflation_rate - 1) * 100
        self.inflation_year = round(self.inflation_year, 3) # adjust the accuracy of the result 
        return self.inflation_year, self.inflation_rate
    
    def arrayInflation(self, inflation_list, inf_last_halv_list = None):
        array_inflation = []
        first_halv_period = self.halving_blocks - self.blocks_per_year

        if self.halving == 0:
            inflation_first_year, inf_rate_first_year = self.inflationFirstYear(inflation_list)
            array_inflation.append(inflation_first_year)
            inflation_rate = inf_rate_first_year
            for i in range(0, first_halv_period-1):
                inflation_year, inflation_rate = self.inflationPeriod(i, self.blocks_per_year + i, inflation_rate, inflation_list)
                array_inflation.append(inflation_year)
        else:
            inf_list_two_halvings = np.concatenate([inf_last_halv_list, inflation_list])
            inflation_after_halving, inf_rate_after_halving = self.inflationDayAfterHalving(inf_list_two_halvings)
            array_inflation.append(inflation_after_halving)
            inflation_rate = inf_rate_after_halving
            len_list_two_halvings = len(inf_list_two_halvings)
            for i in range(first_halv_period + 1, len_list_two_halvings - self.blocks_per_year):
                inflation_year, inflation_rate = self.inflationPeriod(i, self.blocks_per_year + i, inflation_rate, inf_list_two_halvings)
                array_inflation.append(inflation_year)

        # for i in range(1, halv_period):
        #     inflation_year, inflation_rate = self.inflationPeriod(i, self.blocks_per_year + i, inflation_rate, inflation_list)
        #     array_inflation.append(inflation_year)

        self.arr_inf_per_day = []

        for i in range(0, len(array_inflation), 144):
            self.arr_inf_per_day.append(array_inflation[i])
        
        return self.arr_inf_per_day, array_inflation


halving_blocks = 210000
first_block = 10
first_issue = 50
first_halv_mined = first_block * first_issue


first_halving = InflationPerHalving(0)
inflation_list = first_halving.inflationBlock(first_halv_mined, first_issue)
arr_inf_per_day, arr_inflation = first_halving.arrayInflation(inflation_list)

second_issue = 25
second_halv_mined = halving_blocks * first_issue

second_halving = InflationPerHalving(1)
inflation_list2 = second_halving.inflationBlock(second_halv_mined, second_issue)
arr_inf_per_day2, arr_inflation2 = second_halving.arrayInflation(inflation_list2, inflation_list)

third_issue = 12.5
third_halv_mined = second_halv_mined + halving_blocks * second_issue
third_halving = InflationPerHalving(2)
inflation_list3 = third_halving.inflationBlock(third_halv_mined, third_issue)
arr_inf_per_day3, arr_inflation3 = third_halving.arrayInflation(inflation_list3, inflation_list2)

fourth_issue = 6.25
fourth_halv_mined = third_halv_mined + halving_blocks * third_issue
fourth_halving = InflationPerHalving(3)
inflation_list4 = fourth_halving.inflationBlock(fourth_halv_mined, fourth_issue)
arr_inf_per_day4, arr_inflation4 = fourth_halving.arrayInflation(inflation_list4, inflation_list3)

fifth_issue = 3.125
fifth_halv_mined = fourth_halv_mined + halving_blocks * fourth_issue
fifth_halving = InflationPerHalving(4)
inflation_list5 = fifth_halving.inflationBlock(fifth_halv_mined, fifth_issue)
arr_inf_per_day5, arr_inflation5 = fifth_halving.arrayInflation(inflation_list5, inflation_list4)


inflation_total = arr_inflation + arr_inflation2 + arr_inflation3 + arr_inflation4 + arr_inflation5

blocks_per_year = 6 * 24 * 365
step = 420

arr_total = inflation_total[0:360:10]
arr_total = arr_total + inflation_total[360:len(inflation_total):step]
# print(f'arr_total values: {arr_total[:50]}\n{arr_total[-50:]}')

x_1 = np.arange(blocks_per_year, blocks_per_year + 360, 10)
x_arr = np.arange(blocks_per_year + 360, len(inflation_total) + blocks_per_year, step)
x_arrtotal = np.concatenate([x_1, x_arr])
# print(f'block numbers: {x_arrtotal[:10], x_arrtotal[-10:]}')
# print(len(x_arrtotal))
# arr_inf_total = len(arr_inflation)
# print(arr_inf_total)

print(f'arr_inflation first halving length: {len(arr_inflation)}')
print(f'array_inflation: {arr_inflation[:15]}')
print(f'inflation_total length: {len(inflation_total)}')

arr_xx = pd.Series(x_arrtotal, index=None)

arr_total = pd.Series(arr_total, index=None)

df = pd.DataFrame(data={'blockNumber': arr_xx, 'annualInflationRate': arr_total})

df.to_csv('btc_inflation.csv', index=False, header=True) # Generate .csv file with data

# print(df)

# arr_total_js = np.arange(0, len(arr_total)*144 - 28, 10900)
# arr_total_js = []
# for i in range(0, len(arr_total)-12, 40):
#     arr_total_js.append(arr_total[i])
#
# print(f'arr_total_js: {arr_total_js}')
# print(f'arr_total js app length: {len(arr_total_js)}')


# fig, ax = plt.subplots()
# ax.set_yscale("log")
#
# fig.set_facecolor("lightgray")
# ax.set_facecolor("lavender")
#
# ax.plot(x_arrtotal, arr_total, color='darkslategray')
# # locator = ticker.MultipleLocator(5000)
# # ax.xaxis.set_minor_locator(locator)
# ax.grid(color='white')
# ax.set_ylabel('annual inflation')
# ax.set_xlabel('number of blocks after block genesis')
# plt.show()
